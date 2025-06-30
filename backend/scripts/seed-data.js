const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function seedData() {
  try {
    console.log('🌱 Seeding database with sample data...');

    // Create sample users
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);

    const users = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        role: 'ADMIN'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        role: 'USER'
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: hashedPassword,
        role: 'USER'
      }
    ];

    console.log('Creating sample users...');
    for (const user of users) {
      await db.query(
        'INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, user.password, user.role]
      );
    }

    // Get user IDs for document creation
    const adminUsers = await db.query('SELECT id FROM users WHERE email = ?', ['john@example.com']);
    const regularUsers = await db.query('SELECT id FROM users WHERE email = ?', ['jane@example.com']);

    if (adminUsers.length === 0 || regularUsers.length === 0) {
      console.log('⚠️  Users not found, skipping document creation');
      return;
    }

    const adminId = adminUsers[0].id;
    const userId = regularUsers[0].id;

    // Create sample documents
    const documents = [
      {
        title: 'Welcome to Frigga Knowledge Base',
        content: `
          <h1>Welcome to Frigga Knowledge Base</h1>
          <p>This is your team's central hub for knowledge management and collaboration.</p>
          
          <h2>Getting Started</h2>
          <p>Here are some key features you can explore:</p>
          <ul>
            <li><strong>Create Documents:</strong> Use the rich text editor to create beautiful documents</li>
            <li><strong>Collaborate:</strong> Share documents with team members and mention them using @username</li>
            <li><strong>Search:</strong> Find information quickly with our powerful search functionality</li>
            <li><strong>Version Control:</strong> Track changes and view document history</li>
          </ul>
          
          <h2>Privacy Controls</h2>
          <p>You can control who has access to your documents:</p>
          <ul>
            <li><strong>Public:</strong> Anyone with the link can view</li>
            <li><strong>Private:</strong> Only you and explicitly shared users can access</li>
          </ul>
          
          <h2>Need Help?</h2>
          <p>If you have any questions, feel free to reach out to the team!</p>
        `,
        is_public: true,
        author_id: adminId
      },
      {
        title: 'Project Guidelines',
        content: `
          <h1>Project Guidelines</h1>
          <p>This document outlines the guidelines for our development projects.</p>
          
          <h2>Code Standards</h2>
          <ul>
            <li>Follow consistent naming conventions</li>
            <li>Write clear, readable code</li>
            <li>Include proper documentation</li>
            <li>Test thoroughly before deployment</li>
          </ul>
          
          <h2>Git Workflow</h2>
          <ol>
            <li>Create a feature branch from main</li>
            <li>Make your changes</li>
            <li>Write tests for new functionality</li>
            <li>Submit a pull request</li>
            <li>Get code review approval</li>
            <li>Merge to main</li>
          </ol>
          
          <h2>Communication</h2>
          <p>Use @mentions to notify team members about important updates or when you need their input.</p>
        `,
        is_public: false,
        author_id: adminId
      },
      {
        title: 'API Documentation',
        content: `
          <h1>API Documentation</h1>
          <p>This document provides information about our REST API endpoints.</p>
          
          <h2>Authentication</h2>
          <p>All API requests require a valid JWT token in the Authorization header:</p>
          <pre><code>Authorization: Bearer YOUR_TOKEN_HERE</code></pre>
          
          <h2>Endpoints</h2>
          
          <h3>Authentication</h3>
          <ul>
            <li><code>POST /api/auth/register</code> - Register a new user</li>
            <li><code>POST /api/auth/login</code> - Login user</li>
            <li><code>GET /api/auth/me</code> - Get current user</li>
          </ul>
          
          <h3>Documents</h3>
          <ul>
            <li><code>GET /api/documents</code> - List documents</li>
            <li><code>POST /api/documents</code> - Create document</li>
            <li><code>GET /api/documents/:id</code> - Get document</li>
            <li><code>PUT /api/documents/:id</code> - Update document</li>
            <li><code>DELETE /api/documents/:id</code> - Delete document</li>
          </ul>
          
          <h2>Response Format</h2>
          <p>All API responses follow this format:</p>
          <pre><code>{
  "success": true,
  "data": { ... },
  "message": "Success message"
}</code></pre>
        `,
        is_public: true,
        author_id: userId
      },
      {
        title: 'Meeting Notes - Q1 Planning',
        content: `
          <h1>Q1 Planning Meeting Notes</h1>
          <p><strong>Date:</strong> January 15, 2024</p>
          <p><strong>Attendees:</strong> @john, @jane, @bob</p>
          
          <h2>Agenda</h2>
          <ol>
            <li>Review Q4 performance</li>
            <li>Set Q1 goals</li>
            <li>Resource allocation</li>
            <li>Timeline planning</li>
          </ol>
          
          <h2>Key Decisions</h2>
          <ul>
            <li>Launch new product feature by end of Q1</li>
            <li>Increase marketing budget by 20%</li>
            <li>Hire 2 new developers</li>
            <li>Implement new customer feedback system</li>
          </ul>
          
          <h2>Action Items</h2>
          <ul>
            <li>@john: Prepare budget proposal</li>
            <li>@jane: Create hiring plan</li>
            <li>@bob: Research feedback system options</li>
          </ul>
          
          <h2>Next Meeting</h2>
          <p>Follow-up meeting scheduled for January 22, 2024</p>
        `,
        is_public: false,
        author_id: adminId
      }
    ];

    console.log('Creating sample documents...');
    for (const doc of documents) {
      const result = await db.query(
        'INSERT IGNORE INTO documents (title, content, is_public, author_id) VALUES (?, ?, ?, ?)',
        [doc.title, doc.content, doc.is_public, doc.author_id]
      );

      // Create initial version for each document
      if (result.insertId) {
        await db.query(
          'INSERT INTO document_versions (document_id, content, version, author_id) VALUES (?, ?, ?, ?)',
          [result.insertId, doc.content, 1, doc.author_id]
        );
      }
    }

    // Create some document shares
    console.log('Creating sample document shares...');
    const sharedDoc = await db.query('SELECT id FROM documents WHERE title = ?', ['Project Guidelines']);
    if (sharedDoc.length > 0) {
      await db.query(
        'INSERT IGNORE INTO document_shares (document_id, user_id, permission) VALUES (?, ?, ?)',
        [sharedDoc[0].id, userId, 'EDIT']
      );
    }

    // Create some mentions
    console.log('Creating sample mentions...');
    const mentionedDoc = await db.query('SELECT id FROM documents WHERE title = ?', ['Meeting Notes - Q1 Planning']);
    if (mentionedDoc.length > 0) {
      await db.query(
        'INSERT IGNORE INTO mentions (document_id, user_id, mentioned_by) VALUES (?, ?, ?)',
        [mentionedDoc[0].id, userId, adminId]
      );
      await db.query(
        'INSERT IGNORE INTO mentions (document_id, user_id, mentioned_by) VALUES (?, ?, ?)',
        [mentionedDoc[0].id, userId, adminId]
      );
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('\nSample accounts created:');
    console.log('Admin: john@example.com / password123');
    console.log('User: jane@example.com / password123');
    console.log('User: bob@example.com / password123');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = seedData; 