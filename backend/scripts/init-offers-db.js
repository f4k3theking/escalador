const db = require('../database/connection');
const fs = require('fs');
const path = require('path');

async function initializeOffersDatabase() {
  try {
    console.log('🚀 Inicializando banco de dados de ofertas...');

    // Lê o schema SQL
    const schemaPath = path.join(__dirname, '../database/schema_offers.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Divide as queries por ponto e vírgula
    const queries = schema
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--'));

    console.log(`📝 Executando ${queries.length} queries...`);

    // Executa cada query
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      try {
        await db.query(query);
        console.log(`✅ Query ${i + 1}/${queries.length} executada com sucesso`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️  Query ${i + 1}/${queries.length} pulada (já existe)`);
        } else {
          console.error(`❌ Erro na query ${i + 1}:`, error.message);
          console.error(`Query: ${query.substring(0, 100)}...`);
        }
      }
    }

    // Verifica se as tabelas foram criadas
    const tablesResult = await db.query(`
      SELECT TABLE_NAME 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name IN ('offers', 'ads_raw', 'scraping_logs', 'user_saved_offers', 'system_config')
    `);

    console.log('📊 Tabelas criadas:', tablesResult.rows.map(row => row.TABLE_NAME));

    // Verifica configurações do sistema
    const configResult = await db.query('SELECT config_key FROM system_config');
    console.log('⚙️  Configurações:', configResult.rows.map(row => row.config_key));

    console.log('✅ Banco de dados de ofertas inicializado com sucesso!');
    
    return {
      success: true,
      message: 'Database initialized successfully',
      tables: tablesResult.rows.map(row => row.TABLE_NAME),
      configs: configResult.rows.map(row => row.config_key)
    };

  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Se executado diretamente
if (require.main === module) {
  initializeOffersDatabase()
    .then(result => {
      console.log('🏁 Inicialização concluída:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = initializeOffersDatabase;
