const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_DATABASE || 'escalador_ads',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  
  // Connection pool settings
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  
  // MySQL specific settings
  charset: 'utf8mb4',
  timezone: '+00:00'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database');
    console.log(`📊 Database: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
  } catch (error) {
    console.error('❌ Error connecting to MySQL:', error.message);
  }
})();

// Query function with error handling
async function query(sql, params = []) {
  const start = Date.now();
  
  try {
    const [rows, fields] = await pool.execute(sql, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Query executed in ${duration}ms:`, {
        query: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
        rows: Array.isArray(rows) ? rows.length : 'N/A'
      });
    }
    
    // Format response similar to PostgreSQL
    const result = {
      rows: Array.isArray(rows) ? rows : [rows],
      rowCount: Array.isArray(rows) ? rows.length : 1,
      fields
    };
    
    // For INSERT queries, add insertId if available
    if (rows.insertId !== undefined) {
      result.insertId = rows.insertId;
    }
    
    return result;
  } catch (error) {
    console.error('❌ Database query error:', {
      query: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
      params: params,
      error: error.message
    });
    throw error;
  }
}

// Transaction helper
async function transaction(callback) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Health check function
async function healthCheck() {
  try {
    const result = await query('SELECT 1 as test_connection');
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'escalador_ads',
      connection: result.rows[0].test_connection === 1 ? 'OK' : 'Failed'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

// Graceful shutdown
async function close() {
  console.log('🔒 Closing database connection pool...');
  await pool.end();
  console.log('✅ Database connection pool closed');
}

// Handle process termination
process.on('SIGINT', close);
process.on('SIGTERM', close);

module.exports = {
  query,
  transaction,
  healthCheck,
  close,
  pool
};
