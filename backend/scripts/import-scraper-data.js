#!/usr/bin/env node
/**
 * Escalador - Importador de Dados do Scraper
 * Importa dados JSON do scraper para MySQL (local e produção)
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

// Configuração do banco (lê do .env ou usa padrões)
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'escalador_ads',
    charset: 'utf8mb4'
};

class ScraperDataImporter {
    constructor() {
        this.connection = null;
        this.stats = {
            imported: 0,
            updated: 0,
            skipped: 0,
            errors: 0
        };
    }

    async connect() {
        try {
            this.connection = await mysql.createConnection(dbConfig);
            console.log('✅ Conectado ao MySQL:', dbConfig.host);
        } catch (error) {
            console.error('❌ Erro ao conectar MySQL:', error.message);
            throw error;
        }
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.end();
            console.log('🔌 Desconectado do MySQL');
        }
    }

    /**
     * Extrai nicho do nome do arquivo JSON
     */
    extractNicheFromFilename(filename) {
        const nicheMap = {
            'emagrecimento': 'Emagrecimento',
            'dieta': 'Dieta',
            'fitness': 'Fitness', 
            'suplementos': 'Suplementos',
            'academia': 'Academia',
            'saude': 'Saúde',
            'beleza': 'Beleza',
            'masculina': 'Saúde Masculina',
            'feminina': 'Saúde Feminina',
            'calvicie': 'Calvície',
            'cabelo': 'Cabelo',
            'protese': 'Prótese Capilar',
            'capilar': 'Capilar',
            'lei da atracao': 'Lei da Atração',
            'atracao': 'Lei da Atração',
            'mentalidade': 'Mentalidade',
            'mindset': 'Mindset',
            'coaching': 'Coaching',
            'autoajuda': 'Autoajuda',
            'relacionamento': 'Relacionamento',
            'namoro': 'Relacionamento',
            'casamento': 'Relacionamento',
            'amor': 'Relacionamento',
            'sedução': 'Sedução',
            'seducao': 'Sedução',
            'conquista': 'Relacionamento',
            'paquera': 'Relacionamento',
            'romance': 'Relacionamento'
        };

        const lowerFilename = filename.toLowerCase();
        
        for (const [keyword, niche] of Object.entries(nicheMap)) {
            if (lowerFilename.includes(keyword)) {
                return niche;
            }
        }
        
        return 'Geral';
    }

    /**
     * Cria ou atualiza uma oferta
     */
    async createOrUpdateOffer(ad, niche) {
        try {
            // Criar assinatura única da oferta (baseada no page_link que tem o nome correto)
            const pageNameForSignature = ad.page_link || ad.page_name || ad.advertiser_name;
            const offerSignature = `${pageNameForSignature}-${ad.advertiser_name}`.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            
            // Verificar se oferta já existe
            const [existingOffers] = await this.connection.execute(
                'SELECT id FROM offers WHERE offer_signature = ?',
                [offerSignature]
            );

            let offerId;
            
            if (existingOffers.length > 0) {
                // Atualizar oferta existente
                offerId = existingOffers[0].id;
                
                await this.connection.execute(`
                    UPDATE offers SET 
                        niche = ?,
                        is_scaled = ?,
                        active_ads_count = ?,
                        page_name = ?,
                        page_id = ?,
                        ad_text_summary = ?,
                        status = 'active',
                        last_scraped = NOW(),
                        updated_at = NOW()
                    WHERE id = ?
                `, [
                    niche,
                    ad.is_scaled || false,
                    ad.result_count || 0,
                    ad.page_link || ad.page_name || '',
                    ad.page_id || '',
                    (ad.ad_text || '').substring(0, 500),
                    offerId
                ]);
                
                this.stats.updated++;
            } else {
                // Criar nova oferta
                offerId = uuidv4();
                
                await this.connection.execute(`
                    INSERT INTO offers (
                        id, niche, offer_signature, is_scaled, active_ads_count,
                        page_name, page_id, ad_text_summary, status,
                        flags, created_at, updated_at, last_scraped
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, NOW(), NOW(), NOW())
                `, [
                    offerId,
                    niche,
                    offerSignature,
                    ad.is_scaled || false,
                    ad.result_count || 0,
                    ad.page_link || ad.page_name || '',
                    ad.page_id || '',
                    (ad.ad_text || '').substring(0, 500),
                    JSON.stringify({
                        is_promotion: (ad.ad_text || '').toLowerCase().includes('promoção'),
                        has_vsl: (ad.landing_page || '').includes('http')
                    })
                ]);
                
                this.stats.imported++;
            }

            return offerId;

        } catch (error) {
            console.error('❌ Erro ao criar/atualizar oferta:', error.message);
            this.stats.errors++;
            return null;
        }
    }

    /**
     * Cria ou atualiza anúncio individual
     */
    async createOrUpdateAd(ad, offerId) {
        try {
            // Verificar se anúncio já existe (por library_id)
            const [existingAds] = await this.connection.execute(
                'SELECT id FROM ads_raw WHERE library_id = ?',
                [ad.library_id]
            );

            if (existingAds.length > 0) {
                // Atualizar anúncio existente
                await this.connection.execute(`
                    UPDATE ads_raw SET 
                        offer_id = ?,
                        ad_text = ?,
                        ad_description = ?,
                        advertiser_name = ?,
                        page_name = ?,
                        page_id = ?,
                        page_image_link = ?,
                        landing_page = ?,
                        start_at = ?,
                        result_count = ?,
                        is_scaled = ?,
                        detailed_creatives = ?,
                        creative_count_detailed = ?,
                        keyword = ?,
                        updated_at = NOW()
                    WHERE library_id = ?
                `, [
                    offerId,
                    ad.ad_text || '',
                    ad.ad_description || '',
                    ad.advertiser_name || '',
                    ad.page_link || ad.page_name || '',
                    ad.page_id || '',
                    ad.page_image_link || '',
                    ad.landing_page || '',
                    ad.start_at || '',
                    ad.result_count || 0,
                    ad.is_scaled || false,
                    JSON.stringify(ad.detailed_creatives || []),
                    ad.creative_count_detailed || 0,
                    ad.keyword || '',
                    ad.library_id
                ]);
            } else {
                // Criar novo anúncio
                const adId = uuidv4();
                
                await this.connection.execute(`
                    INSERT INTO ads_raw (
                        id, offer_id, library_id, ad_text, ad_description, advertiser_name,
                        page_name, page_id, page_image_link, landing_page, start_at,
                        result_count, is_scaled, detailed_creatives, creative_count_detailed,
                        keyword, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `, [
                    adId,
                    offerId,
                    ad.library_id || '',
                    ad.ad_text || '',
                    ad.ad_description || '',
                    ad.advertiser_name || '',
                    ad.page_link || ad.page_name || '',
                    ad.page_id || '',
                    ad.page_image_link || '',
                    ad.landing_page || '',
                    ad.start_at || '',
                    ad.result_count || 0,
                    ad.is_scaled || false,
                    JSON.stringify(ad.detailed_creatives || []),
                    ad.creative_count_detailed || 0,
                    ad.keyword || ''
                ]);
            }

        } catch (error) {
            console.error('❌ Erro ao criar/atualizar anúncio:', error.message);
            this.stats.errors++;
        }
    }

    /**
     * Importa arquivo JSON
     */
    async importJsonFile(filePath) {
        try {
            console.log(`\n📂 Importando: ${path.basename(filePath)}`);
            
            // Ler arquivo JSON
            const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            if (!jsonData.ads || !Array.isArray(jsonData.ads)) {
                throw new Error('Formato JSON inválido: campo "ads" não encontrado');
            }

            // Extrair nicho do nome do arquivo
            const filename = path.basename(filePath, '.json');
            const niche = this.extractNicheFromFilename(filename);
            
            console.log(`🎯 Nicho detectado: ${niche}`);
            console.log(`📊 Total de anúncios: ${jsonData.ads.length}`);

            // Processar cada anúncio
            for (let i = 0; i < jsonData.ads.length; i++) {
                const ad = jsonData.ads[i];
                
                // Mostrar progresso
                if (i % 10 === 0 || i === jsonData.ads.length - 1) {
                    process.stdout.write(`\r📈 Processando: ${i + 1}/${jsonData.ads.length}`);
                }

                // Criar/atualizar oferta
                const offerId = await this.createOrUpdateOffer(ad, niche);
                
                if (offerId) {
                    // Criar/atualizar anúncio
                    await this.createOrUpdateAd(ad, offerId);
                }
            }
            
            console.log(`\n✅ Arquivo processado com sucesso!`);

        } catch (error) {
            console.error(`❌ Erro ao importar ${filePath}:`, error.message);
            this.stats.errors++;
        }
    }

    /**
     * Importa múltiplos arquivos ou diretório
     */
    async importData(input) {
        console.log('🚀 Iniciando importação de dados do scraper...\n');
        
        await this.connect();

        try {
            const stat = fs.statSync(input);
            
            if (stat.isFile()) {
                // Arquivo único
                await this.importJsonFile(input);
            } else if (stat.isDirectory()) {
                // Diretório - processar todos os JSONs
                const files = fs.readdirSync(input)
                    .filter(file => file.endsWith('.json'))
                    .map(file => path.join(input, file));
                
                console.log(`📁 Encontrados ${files.length} arquivo(s) JSON`);
                
                for (const file of files) {
                    await this.importJsonFile(file);
                }
            }

        } catch (error) {
            console.error('❌ Erro durante importação:', error.message);
        } finally {
            await this.disconnect();
        }

        // Exibir estatísticas finais
        console.log('\n📊 RELATÓRIO DE IMPORTAÇÃO:');
        console.log(`✅ Ofertas criadas: ${this.stats.imported}`);
        console.log(`🔄 Ofertas atualizadas: ${this.stats.updated}`);
        console.log(`⏭️ Pulados: ${this.stats.skipped}`);
        console.log(`❌ Erros: ${this.stats.errors}`);
    }
}

// Executar script se chamado diretamente
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`
🎯 Escalador - Importador de Dados do Scraper

Uso:
  node import-scraper-data.js <arquivo_ou_diretorio>

Exemplos:
  node import-scraper-data.js emagrecimento.json
  node import-scraper-data.js "../fb-scraper-main/data import/"
  node import-scraper-data.js ../fb-scraper-main/scraped_data/
        `);
        process.exit(1);
    }

    const input = args[0];
    
    if (!fs.existsSync(input)) {
        console.error(`❌ Arquivo/diretório não encontrado: ${input}`);
        process.exit(1);
    }

    const importer = new ScraperDataImporter();
    importer.importData(input)
        .then(() => {
            console.log('\n🎉 Importação concluída!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Erro fatal:', error.message);
            process.exit(1);
        });
}

module.exports = ScraperDataImporter;
