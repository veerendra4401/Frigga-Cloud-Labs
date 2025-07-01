const db = require('../config/database');

async function checkData() {
  try {
    // Check users
    console.log('\nChecking users:');
    const [users] = await db.query('SELECT id, name, email, role FROM users');
    console.log('Users:', users);

    // Check documents
    console.log('\nChecking documents:');
    const [docs] = await db.query(`
      SELECT 
        d.id, d.title, d.content, d.is_public, d.created_at, d.updated_at,
        u.id as author_id, u.name as author_name, u.email as author_email
      FROM documents d
      JOIN users u ON d.author_id = u.id
    `);
    console.log('Documents:', docs);

    // Check document shares
    console.log('\nChecking document shares:');
    const [shares] = await db.query(`
      SELECT ds.*, 
             d.title as document_title,
             u.name as shared_with_user
      FROM document_shares ds
      JOIN documents d ON ds.document_id = d.id
      JOIN users u ON ds.user_id = u.id
    `);
    console.log('Shares:', shares);

  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await db.close();
  }
}

checkData(); 