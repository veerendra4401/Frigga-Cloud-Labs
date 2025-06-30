# Frigga Knowledge Base - Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### 1. Prerequisites
- Node.js 18+ installed
- MySQL 8.0+ installed and running
- Git installed

### 2. Clone and Install
```bash
git clone <your-repo-url>
cd Frigga

# Install all dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 3. Database Setup
```bash
cd backend

# Copy environment file
cp env.example .env

# Edit .env with your MySQL credentials
# Update: DB_USER, DB_PASSWORD

# Create database and tables
npm run db:setup

# Add sample data
npm run db:seed
```

### 4. Start the Application
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm start
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 👥 Demo Accounts
- **Admin**: `john@example.com` / `password123`
- **User**: `jane@example.com` / `password123`
- **User**: `bob@example.com` / `password123`

## 🔧 Environment Variables

Create `.env` file in `backend/` directory:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=frigga_kb
DB_PORT=3306

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

## 📋 Features Implemented

✅ **Core Features**
- User authentication (register/login/logout)
- Rich text document editor (React Quill)
- Document CRUD operations
- Search functionality
- Privacy controls (public/private)
- Auto-save functionality
- Responsive design

✅ **Collaboration Features**
- User mentions (@username)
- Document sharing with permissions
- Version control and history
- Real-time auto-save

✅ **Advanced Features**
- JWT-based authentication
- Role-based access control
- Full-text search
- Document versioning
- Mention notifications
- Modern UI/UX

## 🛠️ Tech Stack

**Frontend**: React 18, TypeScript, Tailwind CSS, React Quill, Zustand
**Backend**: Node.js, Express.js, MySQL, JWT, bcryptjs
**Database**: MySQL with full-text search and foreign keys

## 🚀 Next Steps

1. **Explore the Features**:
   - Create your first document
   - Try the rich text editor
   - Test search functionality
   - Share documents with other users

2. **Customize**:
   - Update branding in `frontend/src/pages/HomePage.tsx`
   - Modify database schema in `backend/scripts/setup-database.js`
   - Add new API endpoints in `backend/routes/`

3. **Deploy**:
   - Set up production database
   - Configure environment variables
   - Deploy backend to your server
   - Build and deploy frontend

## 🆘 Troubleshooting

**Database Connection Issues**:
- Verify MySQL is running
- Check credentials in `.env`
- Ensure database `frigga_kb` exists

**Port Conflicts**:
- Backend: Change `PORT` in `.env`
- Frontend: Change port in `package.json` scripts

**Build Issues**:
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version`

## 📞 Support

For issues or questions:
1. Check the main README.md
2. Review the API documentation
3. Check the console for error messages
4. Verify all prerequisites are installed

---

**Happy coding! 🎉** 