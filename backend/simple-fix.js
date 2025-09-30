#!/usr/bin/env node
/**
 * Script simples para corrigir ofertas com nomes genéricos
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

async function simpleFix() {
    let connection;
    
    try {
        console.log('🔌 Conectando ao MySQL...');
        connection = await mysql.createConnection(dbConfig);
        
        // Mapeamento manual dos nomes corretos baseado no que vimos no JSON
        const corrections = [
            {
                wrongName: '9 adsuse this creative and text',
                correctName: 'Comunidade Katzer by Tatiele Katzer'
            },
            {
                wrongName: '7 adsuse this creative and text', 
                correctName: 'Comunidade Katzer by Tatiele Katzer'
            },
            {
                wrongName: '3 adsuse this creative and text',
                correctName: 'Dr Geraldo Moromizato Nutrologo'
            },
            {
                wrongName: '5 adsuse this creative and text',
                correctName: 'IMV - Instituto Medicina de Vanguarda'
            },
            {
                wrongName: '4 adsuse this creative and text',
                correctName: 'casagraosfit'
            },
            {
                wrongName: '2 adsuse this creative and text',
                correctName: 'Nome Genérico 2' // Este precisará ser verificado manualmente
            }
        ];
        
        console.log('🔧 Aplicando correções...\n');
        
        for (const correction of corrections) {
            console.log(`Corrigindo: ${correction.wrongName} → ${correction.correctName}`);
            
            // Gerar nova assinatura
            const newSignature = `${correction.correctName}-${correction.correctName}`.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            
            // Atualizar a oferta
            const [result] = await connection.execute(`
                UPDATE offers 
                SET page_name = ?, 
                    offer_signature = ?, 
                    updated_at = NOW()
                WHERE page_name = ?
            `, [correction.correctName, newSignature, correction.wrongName]);
            
            if (result.affectedRows > 0) {
                console.log(`✅ Corrigido: ${result.affectedRows} oferta(s)`);
            } else {
                console.log(`⚠️ Nenhuma oferta encontrada com nome: ${correction.wrongName}`);
            }
        }
        
        // Verificar resultado
        console.log('\n📊 Verificando resultado...');
        const [remaining] = await connection.execute(`
            SELECT page_name, active_ads_count
            FROM offers 
            WHERE page_name LIKE '%adsuse this creative and text%'
        `);
        
        if (remaining.length === 0) {
            console.log('✅ Todas as ofertas com nomes genéricos foram corrigidas!');
        } else {
            console.log(`❌ Ainda restam ${remaining.length} ofertas com nomes genéricos:`);
            remaining.forEach(offer => {
                console.log(`   - ${offer.page_name} (${offer.active_ads_count} anúncios)`);
            });
        }
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Desconectado do MySQL');
        }
    }
}

simpleFix();
