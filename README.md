# Knowledge Base Platform

A modern, Confluence-like knowledge base platform built with React, Express.js, and MySQL. This platform enables teams to create, collaborate, and organize their knowledge with powerful features like real-time editing, version control, and advanced privacy controls.

## 🚀 Features

### Core Features
- **User Authentication**: Secure JWT-based authentication with registration, login, and password reset
- **Rich Document Editor**: WYSIWYG editor with formatting, images, and collaborative editing
- **Document Management**: Create, edit, view, and organize documents with metadata
- **Search Functionality**: Global search across document titles and content
- **Privacy Controls**: Public and private documents with granular sharing permissions
- **Auto-Save**: Automatic saving to prevent data loss
- **Responsive Design**: Modern, mobile-friendly interface

### Collaboration Features
- **User Mentions**: @username functionality that triggers notifications
- **Document Sharing**: Share documents with team members with view/edit permissions
- **Version Control**: Track all document changes with timestamps and history
- **Real-time Collaboration**: Multiple users can work on documents simultaneously

### Advanced Features
- **Version History**: View and compare document versions
- **Mention System**: Notify team members with @mentions
- **Document Analytics**: Track document views and engagement
- **Export Options**: Export documents in various formats

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **React Router** - Client-side routing
- **React Quill** - Rich text editor
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **React Hook Form** - Form handling
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library
- **Framer Motion** - Animations

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Relational database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger

### Database
- **MySQL 8.0+** - Primary database
- **Connection Pooling** - Optimized database connections
- **Full-text Search** - Advanced search capabilities
- **Foreign Key Constraints** - Data integrity

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Frigga
```

### 2. Install Dependencies

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

### 3. Database Setup

```bash
# Navigate to backend directory
cd backend

# Copy environment file
cp env.example .env

# Edit .env file with your database credentials
# Update DB_HOST, DB_USER, DB_PASSWORD, etc.

# Setup database tables
npm run db:setup

# Seed with sample data
npm run db:seed
```

### 4. Start Development Servers

```bash
# Start backend server (from backend directory)
npm run dev

# Start frontend server (from frontend directory, in a new terminal)
cd frontend
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=frigga_kb
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email Configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@frigga-kb.com

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

### Database Configuration

1. Create a MySQL database named `frigga_kb`
2. Update the database credentials in your `.env` file
3. Run the setup script to create tables: `npm run db:setup`
4. Seed the database with sample data: `npm run db:seed`

## 👥 Demo Accounts

After running the seed script, you can use these demo accounts:

- **Admin User**: `john@example.com` / `password123`
- **Regular User**: `jane@example.com` / `password123`
- **Regular User**: `bob@example.com` / `password123`

## 📁 Project Structure

```
Frigga/
├── backend/                 # Express.js backend
│   ├── config/             # Database configuration
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── scripts/            # Database setup and seeding
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React frontend
│   ├── public/             # Static files
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   └── App.tsx         # Main app component
│   └── package.json        # Frontend dependencies
├── package.json            # Root package.json
└── README.md              # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset

### Documents
- `GET /api/documents` - List documents (with pagination and search)
- `POST /api/documents` - Create new document
- `GET /api/documents/:id` - Get document by ID
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/:id/versions` - Get document versions
- `POST /api/documents/:id/share` - Share document
- `DELETE /api/documents/:id/share` - Remove document share

### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/notifications` - Get user notifications

## 🚀 Deployment

### Backend Deployment

1. Set up a production MySQL database
2. Update environment variables for production
3. Install dependencies: `npm install --production`
4. Start the server: `npm start`

### Frontend Deployment

1. Build the production bundle: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Update the API base URL in production

### Docker Deployment (Optional)

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 🎯 Roadmap

- [ ] Real-time collaborative editing
- [ ] Advanced search filters
- [ ] Document templates
- [ ] Mobile app
- [ ] API rate limiting
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Document export (PDF, Word)
- [ ] Integration with external tools
- [ ] Advanced permission system

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI framework
- [Express.js](https://expressjs.com/) - Web framework
- [MySQL](https://www.mysql.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [React Quill](https://github.com/zenoamaro/react-quill) - Rich text editor

---

**Built with ❤️ for modern teams** 
