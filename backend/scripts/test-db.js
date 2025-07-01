const db = require('../config/database');

async function testDatabase() {
  try {
    console.log('1. Testing database connection...');
    await db.testConnection();
    
    console.log('\n2. Checking tables...');
    const [tables] = await db.query('SHOW TABLES');
    console.log('Tables found:', tables);
    
    console.log('\n3. Testing document creation...');
    // First, let's make sure we have a valid user
    const [users] = await db.query('SELECT id FROM users LIMIT 1');
    if (!users || users.length === 0) {
      throw new Error('No users found in the database. Please run the seed script first.');
    }
    
    const testDoc = {
      title: 'Test Document',
      content: 'This is a test document content',
      is_public: true,
      author_id: users[0].id
    };
    
    try {
      const result = await db.query(
        'INSERT INTO documents (title, content, is_public, author_id) VALUES (?, ?, ?, ?)',
        [testDoc.title, testDoc.content, testDoc.is_public, testDoc.author_id]
      );
      console.log('Document created successfully:', result);
      
      // Try to read the created document
      const [doc] = await db.query('SELECT * FROM documents WHERE id = ?', [result.insertId]);
      console.log('Created document:', doc[0]);
      
      // Clean up - delete the test document
      await db.query('DELETE FROM documents WHERE id = ?', [result.insertId]);
      console.log('Test document cleaned up');
    } catch (error) {
      console.error('Error during document creation test:', error);
      throw error; // Re-throw to see the full error
    }
    
    console.log('\n4. Checking database state...');
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
    console.log('Total users:', userCount[0].count);
    const [docCount] = await db.query('SELECT COUNT(*) as count FROM documents');
    console.log('Total documents:', docCount[0].count);
    
    console.log('\n✅ All database tests completed!');
  } catch (error) {
    console.error('\n❌ Database test failed:', error);
  } finally {
    await db.close();
  }
}

testDatabase(); 