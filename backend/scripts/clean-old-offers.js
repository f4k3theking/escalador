#!/usr/bin/env node
/**
 * Escalador - Limpeza de Ofertas Antigas
 * Remove ofertas antigas com URLs expiradas
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'escalador_ads',
    charset: 'utf8mb4'
};

class OldOffersCleaner {
    constructor() {
        this.connection = null;
        this.stats = {
            offers_deleted: 0,
            ads_deleted: 0,
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
     * Verifica se uma oferta tem URLs expiradas
     */
    async checkOfferHasExpiredUrls(offerId) {
        try {
            // Buscar anúncios da oferta
            const [ads] = await this.connection.execute(
                'SELECT detailed_creatives FROM ads_raw WHERE offer_id = ?',
                [offerId]
            );

            if (ads.length === 0) {
                return true; // Sem anúncios = expirada
            }

            // Verificar se tem URLs do Facebook (que expiram)
            for (const ad of ads) {
                const creatives = JSON.parse(ad.detailed_creatives || '[]');
                
                for (const creative of creatives) {
                    if (creative.urls) {
                        // Verificar URLs de vídeo
                        if (creative.urls.video_url && 
                            creative.urls.video_url.includes('video.fcgh5-1.fna.fbcdn.net')) {
                            return true; // Tem URL do Facebook = expirada
                        }
                        
                        // Verificar URLs de thumbnail
                        if (creative.urls.thumbnail_url && 
                            creative.urls.thumbnail_url.includes('scontent.fcgh5-2.fna.fbcdn.net')) {
                            return true; // Tem URL do Facebook = expirada
                        }
                    }
                }
            }

            return false; // Não tem URLs expiradas
        } catch (error) {
            console.error('❌ Erro ao verificar URLs:', error.message);
            return true; // Em caso de erro, considerar expirada
        }
    }

    /**
     * LIMPEZA TOTAL - Remove TODAS as ofertas
     */
    async cleanAllOffers() {
        try {
            console.log('🗑️ LIMPEZA TOTAL - Removendo TODAS as ofertas...');
            
            // Deletar TODOS os anúncios primeiro (devido à foreign key)
            const [adsResult] = await this.connection.execute('DELETE FROM ads_raw');
            console.log(`🗑️ Anúncios removidos: ${adsResult.affectedRows}`);
            this.stats.ads_deleted = adsResult.affectedRows;
            
            // Deletar TODAS as ofertas
            const [offersResult] = await this.connection.execute('DELETE FROM offers');
            console.log(`🗑️ Ofertas removidas: ${offersResult.affectedRows}`);
            this.stats.offers_deleted = offersResult.affectedRows;
            
            console.log('✅ LIMPEZA TOTAL CONCLUÍDA!');

        } catch (error) {
            console.error('❌ Erro durante limpeza total:', error.message);
            this.stats.errors++;
        }
    }

    /**
     * Limpeza por data (remove ofertas antigas)
     */
    async cleanByDate(daysOld = 7) {
        try {
            console.log(`🗑️ Removendo ofertas com mais de ${daysOld} dias...`);
            
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            
            // Buscar ofertas antigas
            const [oldOffers] = await this.connection.execute(
                'SELECT id, page_name FROM offers WHERE last_scraped < ?',
                [cutoffDate]
            );
            
            console.log(`📊 Ofertas antigas encontradas: ${oldOffers.length}`);
            
            for (const offer of oldOffers) {
                console.log(`🗑️ Removendo oferta antiga: ${offer.page_name}`);
                
                // Deletar anúncios primeiro
                const [adsResult] = await this.connection.execute(
                    'DELETE FROM ads_raw WHERE offer_id = ?',
                    [offer.id]
                );
                
                // Deletar oferta
                await this.connection.execute(
                    'DELETE FROM offers WHERE id = ?',
                    [offer.id]
                );
                
                this.stats.offers_deleted++;
                this.stats.ads_deleted += adsResult.affectedRows;
            }
            
        } catch (error) {
            console.error('❌ Erro durante limpeza por data:', error.message);
            this.stats.errors++;
        }
    }

    /**
     * Executar limpeza total
     */
    async run() {
        console.log('🧹 INICIANDO LIMPEZA TOTAL');
        console.log('=' * 50);
        
        await this.connect();
        
        try {
            await this.cleanAllOffers();
            
            // Exibir estatísticas finais
            console.log('\n📊 RELATÓRIO DE LIMPEZA:');
            console.log(`🗑️ Ofertas removidas: ${this.stats.offers_deleted}`);
            console.log(`🗑️ Anúncios removidos: ${this.stats.ads_deleted}`);
            console.log(`❌ Erros: ${this.stats.errors}`);
            
        } catch (error) {
            console.error('❌ Erro durante limpeza:', error.message);
        } finally {
            await this.disconnect();
        }
    }
}

// Executar script se chamado diretamente
if (require.main === module) {
    console.log(`
🧹 Escalador - LIMPEZA TOTAL DE OFERTAS

⚠️  ATENÇÃO: Este script remove TODAS as ofertas e anúncios!
⚠️  Use apenas quando for minerar novos dados!

Uso:
  node clean-old-offers.js

Este script:
  ✅ Remove TODAS as ofertas
  ✅ Remove TODOS os anúncios
  ✅ Prepara banco para novos dados
    `);
    
    const cleaner = new OldOffersCleaner();
    cleaner.run()
        .then(() => {
            console.log('\n🎉 LIMPEZA TOTAL CONCLUÍDA!');
            console.log('✅ Banco limpo e pronto para novos dados!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Erro fatal:', error.message);
            process.exit(1);
        });
}

module.exports = OldOffersCleaner;
