@echo off
echo ========================================
echo Frigga Knowledge Base - Setup Script
echo ========================================
echo.

echo Step 1: Installing dependencies...
echo Installing root dependencies...
call npm install

echo Installing backend dependencies...
cd backend
call npm install

echo Installing frontend dependencies...
cd ../frontend
call npm install
cd ..

echo.
echo Step 2: Setting up environment...
cd backend
if not exist .env (
    echo Creating .env file from template...
    copy env.example .env
    echo.
    echo IMPORTANT: Please edit backend\.env and set your MySQL password!
    echo Open backend\.env and change DB_PASSWORD= to your actual MySQL password
    echo.
    pause
) else (
    echo .env file already exists
)

echo.
echo Step 3: Database setup...
echo Please make sure MySQL is running before continuing...
echo.
pause

echo Running database setup...
call npm run db:setup

echo.
echo Running database seeding...
call npm run db:seed

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application:
echo.
echo Terminal 1 (Backend):
echo   cd backend
echo   npm run dev
echo.
echo Terminal 2 (Frontend):
echo   cd frontend
echo   npm start
echo.
echo Then visit: http://localhost:3000
echo.
echo Demo accounts:
echo   Admin: john@example.com / password123
echo   User: jane@example.com / password123
echo   User: bob@example.com / password123
echo.
pause 