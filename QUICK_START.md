# 🚀 Frigga Knowledge Base - Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- MySQL 8.0+ installed and running
- Git installed

## Step 1: Database Setup

### 1.1 Start MySQL Service
Make sure MySQL is running on your system.

### 1.2 Create Database (Optional)
If you want to create the database manually:
```sql
CREATE DATABASE frigga_kb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 1.3 Configure Environment Variables
```bash
cd backend
copy env.example .env
```

Edit the `.env` file and update your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=frigga_kb
DB_PORT=3306
```

**Important**: Replace `your_mysql_password_here` with your actual MySQL root password.

## Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 3: Setup Database Tables

```bash
cd backend
npm run db:setup
npm run db:seed
```

## Step 4: Start the Application

### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm start
```

## Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Demo Accounts

After running the seed script, you can use these accounts:

- **Admin**: `john@example.com` / `password123`
- **User**: `jane@example.com` / `password123`
- **User**: `bob@example.com` / `password123`

## Troubleshooting

### Database Connection Issues
1. Make sure MySQL is running
2. Verify your password in the `.env` file
3. Try connecting to MySQL manually to test credentials
4. If using XAMPP/WAMP, make sure the MySQL service is started

### Port Issues
- If port 5000 is busy, change `PORT` in backend `.env`
- If port 3000 is busy, React will automatically suggest an alternative

### Common MySQL Issues
- **Access denied**: Check your MySQL root password
- **Connection refused**: Make sure MySQL service is running
- **Database doesn't exist**: The setup script will create it automatically

## Quick Test

Once both servers are running, you should be able to:
1. Visit http://localhost:3000
2. See the landing page
3. Click "Get Started" to register
4. Or use the demo accounts to login

## Next Steps

1. Explore the features by creating documents
2. Try the rich text editor
3. Test search functionality
4. Share documents with other users
5. Check out the version control features

---

**Need help?** Check the main README.md for detailed documentation. 