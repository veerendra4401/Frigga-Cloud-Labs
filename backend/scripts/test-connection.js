const db = require('../config/database');

async function testDatabaseConnection() {
  try {
    // Test connection
    console.log('Testing database connection...');
    await db.testConnection();

    // Test simple query
    console.log('\nTesting simple query...');
    const [result] = await db.query('SELECT 1 + 1 as test');
    console.log('Query result:', result);

    // Test parameterized query
    console.log('\nTesting parameterized query...');
    const [paramResult] = await db.query('SELECT ? + ? as sum', [2, 3]);
    console.log('Parameterized query result:', paramResult);

    // Test document query with LIMIT
    console.log('\nTesting document query with LIMIT...');
    const docs = await db.query('SELECT * FROM documents LIMIT ? OFFSET ?', [2, 0]);
    console.log('Documents query result:', docs);

  } catch (error) {
    console.error('Test failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sql: error.sql
    });
  } finally {
    await db.close();
  }
}

testDatabaseConnection(); 