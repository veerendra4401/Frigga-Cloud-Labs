const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'frigga_kb',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  timezone: '+00:00',
  // Connection pool configuration
  connectionLimit: 10,
  // Return results as arrays
  rowsAsArray: false,
  // Convert MySQL boolean values to JS booleans
  typeCast: function (field, next) {
    if (field.type === 'TINY' && field.length === 1) {
      return field.string() === '1'; // Convert TINYINT(1) to boolean
    }
    return next();
  },
  // SSL configuration for production
  ...(process.env.NODE_ENV === 'production' && {
    ssl: {
      rejectUnauthorized: false
    }
  })
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Execute query with error handling and consistent result format
async function query(sql, params = []) {
  try {
    console.log('Executing query:', {
      sql,
      params
    });
    const [rows] = await pool.execute(sql, params);
    console.log('Query result:', {
      rowCount: rows?.length,
      firstRow: rows?.[0]
    });
    return rows;
  } catch (error) {
    console.error('Database query error:', {
      sql,
      params,
      error
    });
    throw error;
  }
}

// Execute transaction
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

// Close all connections
async function close() {
  await pool.end();
}

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  close
}; 
