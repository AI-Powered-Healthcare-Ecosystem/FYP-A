# AI-Powered Healthcare Ecosystem - Installation & Setup Guide

A comprehensive patient management system with integrated AI/ML features for diabetes risk prediction, therapy effectiveness analysis, and intelligent treatment recommendations.

## Architecture

- **Frontend**: React + Vite + Material-UI + TailwindCSS
- **Backend**: Laravel 11 (PHP)
- **ML Service**: FastAPI (Python)
- **Database**: MySQL (Azure)
- **AI/ML**: Scikit-learn, Langflow, OpenAI, Groq

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **PHP** >= 8.2
- **Composer** (PHP package manager)
- **Node.js** >= 18.x and **npm**
- **Python** >= 3.9
- **MySQL** (or access to Azure MySQL)

---

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Paitent Management System"
```

### 2. Backend Setup (Laravel)

```bash
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure your .env file with database credentials
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=your_database
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# Run database migrations
php artisan migrate

# Seed the database (optional)
php artisan db:seed
```

### 3. FastAPI ML Service Setup

```bash
cd backend/fastapi

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file and add your API keys
# LANGFLOW_API_KEY=your_key
# GROQ_API_KEY=your_key
# OPENAI_API_KEY=your_key
# PINECONE_API_KEY=your_key
```

### 4. Frontend Setup (React)

```bash
cd frontend

# Install Node dependencies
npm install

# Create .env file
echo "VITE_LARAVEL_URL=http://localhost:8000" > .env
```

---

## Running the Project Locally

You need to run **three separate terminals** for the complete system:

### Terminal 1: Laravel Backend

```bash
cd backend
php artisan serve --host=localhost --port=8000
```

Backend will be available at: `http://localhost:8000`

### Terminal 2: FastAPI ML Service

```bash
cd backend/fastapi

# Activate virtual environment first
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Start FastAPI server
uvicorn main:app --reload --port 5000
```

ML Service will be available at: `http://localhost:5000`

### Terminal 3: React Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## Default Credentials

After seeding the database, you can login with:

**Admin:**
- Email: `admin@example.com`
- Password: `password`

**Doctor:**
- Email: `doctor@example.com`
- Password: `password`

**Patient:**
- Email: `patient@example.com`
- Password: `password`

---

## Testing the System

1. Open your browser and navigate to `http://localhost:5173`
2. Login with one of the default credentials
3. Test features:
   - Patient management
   - Appointment scheduling
   - Real-time messaging
   - Diabetes risk prediction
   - Therapy effectiveness analysis
   - Treatment recommendations
   - AI chatbot

---

## Project Structure

```
Paitent Management System/
├── backend/                 # Laravel backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   └── Middleware/
│   │   ├── Models/
│   │   └── Helpers/
│   ├── routes/
│   │   └── api.php         # API routes
│   ├── database/
│   │   └── migrations/
│   └── .env                # Environment variables
│
├── backend/fastapi/         # FastAPI ML service
│   ├── main.py             # FastAPI application
│   ├── models/             # ML model files
│   ├── requirements.txt    # Python dependencies
│   └── .env                # ML service environment variables
│
└── frontend/                # React frontend
    ├── src/
    │   ├── features/       # Feature modules
    │   ├── components/     # Reusable components
    │   └── UserContext.jsx # Global state management
    ├── package.json
    └── .env                # Frontend environment variables
```

---

## Security Features

- Session-based authentication
- Role-based access control (Admin, Doctor, Patient)
- Protected API routes with middleware
- CORS configuration for secure cross-origin requests
- Activity logging with anonymized data
- Secure password hashing

---

## API Endpoints

### Public Routes
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Authenticated Routes
- `GET /api/patients` - List patients
- `GET /api/appointments` - List appointments
- `GET /api/messages/conversations` - Get conversations
- `POST /api/chatbot/message` - Chat with AI
- `POST /api/logout` - User logout

### Admin Routes (Admin only)
- `GET /api/admin/users` - List all users
- `GET /api/admin/activity-logs` - View activity logs
- `DELETE /api/admin/users/{id}` - Delete user

### ML Endpoints (FastAPI)
- `POST /predict-therapy-pathline` - Therapy effectiveness analysis
- `POST /treatment-recommendation` - Get treatment recommendations
- `POST /treatment-chat` - Treatment chatbot

---

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Laravel (change port)
php artisan serve --port=8001

# FastAPI (change port)
uvicorn main:app --reload --port=5001

# Frontend (change port)
npm run dev -- --port 5174
```

### Database Connection Issues

1. Ensure MySQL is running
2. Check `.env` database credentials
3. Run `php artisan migrate:fresh` to reset database

### CORS Errors

1. Check `backend/config/cors.php` has correct frontend URL
2. Ensure `credentials: 'include'` is set in frontend fetch calls
3. Verify `SESSION_SAME_SITE=lax` in backend `.env`

### ML Service Not Working

1. Ensure virtual environment is activated
2. Check all API keys are set in `backend/fastapi/.env`
3. Verify Python dependencies are installed

---

## Deployment

For production deployment:

1. Set `APP_ENV=production` and `APP_DEBUG=false`
2. Configure `SESSION_SECURE_COOKIE=true` (requires HTTPS)
3. Set `SESSION_SAME_SITE=none` for cross-domain sessions
4. Add production frontend URL to CORS configuration
5. Use environment variables for all sensitive data

---

## Support

For issues or questions, please refer to the documentation or contact the development team.
