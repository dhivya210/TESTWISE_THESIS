# TestWise

A comprehensive decision-support web application that helps users choose the best test automation tool (Selenium, Playwright, Testim, or Mabl) based on their project requirements through an interactive questionnaire and AI-powered chatbot assistance.

![TestWise](https://img.shields.io/badge/TestWise-v1.0.0-blue)
![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Authentication](#authentication)
- [Scripts & Utilities](#scripts--utilities)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

TestWise is a full-stack web application designed to help development teams make informed decisions about test automation tools. It combines:

- **Interactive Questionnaire**: 12-question assessment covering budget, team skills, scalability, and AI capabilities
- **Smart Recommendations**: Data-driven tool recommendations based on user responses
- **AI Chatbot**: RAG-powered chatbot that answers questions about the four supported tools
- **Analytics Dashboard**: Visual comparisons and detailed insights with interactive charts
- **User Management**: Secure authentication with Firebase integration and guest mode support

## Features

### Core Features
-  **Smart Recommendations** - Personalized tool recommendations based on specific requirements
-  **Data-Driven Insights** - Interactive charts and comparative metrics
-  **AI Chatbot** - RAG-powered assistant for tool-related questions
-  **Secure Authentication** - Firebase-based authentication with email verification
-  **Guest Mode** - Try the application without creating an account
-  **PDF Export** - Export evaluation results as PDF
-  **Evaluation History** - Track and review past evaluations
-  **Modern UI** - Beautiful, responsive design with Tailwind CSS
-  **Fast Performance** - Built with React 18 and Vite
-  **Theme Support** - Light/Dark theme preferences

### Technical Features
- **RESTful API** - Express.js backend with SQLite database
- **Vector Search** - FAISS-based vector store for RAG functionality
- **Real-time Updates** - Live data synchronization
- **Responsive Design** - Mobile-first approach
- **Type Safety** - Full TypeScript implementation
- **Error Handling** - Comprehensive error boundaries and validation

##  Architecture

TestWise consists of three main components:

```
┌─────────────────┐
│   Frontend      │  React + TypeScript + Vite
│   (Port 5173)   │  └─ UI Components
│                 │  └─ State Management
│                 │  └─ Routing
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
┌────────▼────────┐  ┌─────▼──────────┐
│   Backend API   │  │  RAG Backend   │
│   (Port 3001)   │  │  (Port 8000)   │
│                 │  │                │
│  Express.js     │  │  FastAPI       │
│  SQLite DB      │  │  OpenAI API    │
│  Authentication │  │  Vector Store  │
└─────────────────┘  └────────────────┘
```

### Component Details

1. **Frontend** (`/src`)
   - React 19 with TypeScript
   - Vite for build tooling
   - React Router for navigation
   - Tailwind CSS for styling
   - shadcn/ui components

2. **Backend API** (`/backend-server`)
   - Express.js REST API
   - SQLite database (better-sqlite3)
   - JWT authentication support
   - CORS enabled

3. **RAG Backend** (`/backend-rag`)
   - FastAPI Python server
   - OpenAI GPT-4 for generation
   - FAISS vector store
   - Knowledge base ingestion

## Tech Stack

### Frontend
- **Framework**: React 19.1.1
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.1.7
- **Routing**: React Router DOM 7.9.5
- **Styling**: Tailwind CSS 3.4.18
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Animations**: Framer Motion 12.23.24
- **Charts**: Recharts 3.3.0, Chart.js 4.5.1
- **PDF Export**: jsPDF 3.0.3
- **Icons**: Lucide React 0.553.0
- **Forms**: React Hook Form 7.66.0
- **Validation**: Zod 4.1.12

### Backend API
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18.2
- **Database**: SQLite (better-sqlite3 11.3.0)
- **Authentication**: bcryptjs 2.4.3, Firebase 12.5.0
- **Security**: CORS 2.8.5

### RAG Backend
- **Language**: Python 3.9+
- **Framework**: FastAPI 0.104.0
- **LLM**: OpenAI GPT-4
- **Embeddings**: OpenAI text-embedding-3-small
- **Vector Store**: FAISS 1.8.0
- **Server**: Uvicorn

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher (comes with Node.js)
- **Python** 3.9 or higher
- **pip** (Python package manager)
- **Git** (for version control)

### Optional but Recommended
- **Firebase Account** (for authentication and email verification)
- **OpenAI API Key** (for RAG chatbot functionality)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/testwise.git
cd testwise
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend-server
npm install
cd ..
```

### 4. Install RAG Backend Dependencies

```bash
cd backend-rag
pip install -r requirements.txt
cd ..
```

### 5. Initialize Database

```bash
cd backend-server
npm run init-db
cd ..
```

This creates the SQLite database with all necessary tables.

### 6. Ingest Knowledge Base (Optional - for RAG chatbot)

```bash
python scripts/ingest_kb.py --dir kb
```

This processes the knowledge base files and creates the vector store.

## Configuration

### Frontend Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api

# Firebase Configuration (Optional)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Backend Configuration

Create a `backend-server/.env` file:

```env
PORT=3001
```

### RAG Backend Configuration

Create a `backend-rag/.env` file:

```env
OPENAI_API_KEY=your-openai-api-key-here
```

### Firebase Setup (Optional)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing one
3. Enable Authentication → Email/Password
4. Copy your Firebase configuration to `.env` file
5. (Optional) Set up Firebase Admin SDK for user management:
   - Go to Project Settings → Service Accounts
   - Generate new private key
   - Save as `backend-server/firebase-admin-key.json`

## Running the Application

### Development Mode

You need to run all three components simultaneously:

#### Terminal 1: Frontend
```bash
npm run dev
```
Frontend will be available at `http://localhost:5173`

#### Terminal 2: Backend API
```bash
cd backend-server
npm run dev
```
Backend API will be available at `http://localhost:3001`

#### Terminal 3: RAG Backend (Optional)
```bash
cd backend-rag
python main.py
```
RAG Backend will be available at `http://localhost:8000`

### Quick Start Scripts (Windows)

Use the provided batch files:

```bash
# Start backend server
start-auth-backend.bat

# Start RAG backend (if configured)
start-rag-backend.bat

# Then start frontend
npm run dev
```

### Production Build

#### Frontend
```bash
npm run build
npm run preview
```

#### Backend
```bash
cd backend-server
npm start
```

#### RAG Backend
```bash
cd backend-rag/src
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Project Structure

```
testwise/
├── frontend/                  # Frontend React application
│   ├── src/                  # Frontend source code
│   │   ├── components/       # Reusable React components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── Navbar.tsx    # Navigation bar
│   │   │   ├── Footer.tsx    # Footer component
│   │   │   ├── ChatWidget.tsx # AI chatbot widget
│   │   │   └── ...
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   ├── pages/               # Page components
│   │   ├── Landing.tsx      # Landing page
│   │   ├── Login.tsx        # Login page
│   │   ├── Signup.tsx       # Signup page
│   │   ├── Questionnaire.tsx # Main questionnaire
│   │   ├── Results.tsx      # Results page
│   │   └── ...
│   ├── lib/                 # Utility libraries
│   │   ├── api.ts           # API client
│   │   ├── firebase.ts      # Firebase config
│   │   └── utils.ts         # Utility functions
│   ├── hooks/               # Custom React hooks
│   ├── data/                # Static data
│   │   └── questions.ts     # Questionnaire questions
│   └── assets/              # Static assets
│
├── backend-server/           # Backend API
│   ├── src/
│   │   ├── index.js         # Express server entry
│   │   ├── routes/          # API routes
│   │   │   ├── auth.js       # Authentication routes
│   │   │   └── evaluations.js # Evaluation routes
│   │   ├── models/          # Data models
│   │   │   ├── User.js       # User model
│   │   │   └── Evaluation.js # Evaluation model
│   │   ├── database/        # Database utilities
│   │   │   ├── db.js         # Database connection
│   │   │   ├── init.js       # Database initialization
│   │   │   ├── schema.sql    # Database schema
│   │   │   └── ...
│   │   └── utils/           # Utility functions
│   └── data/                # Database files
│       └── testwise.db       # SQLite database
│
├── backend-rag/             # RAG chatbot backend
│   ├── src/
│   │   ├── main.py          # FastAPI application
│   │   ├── llm_client.py    # OpenAI LLM client
│   │   ├── embeddings_client.py # Embeddings client
│   │   ├── vector_store.py  # Vector store implementation
│   │   ├── prompts.py       # Prompt templates
│   │   └── text_splitter.py # Text chunking
│   ├── tests/               # Test files
│   └── data/                # Vector store data
│
├── kb/                      # Knowledge base
│   ├── selenium/            # Selenium documentation
│   ├── playwright/          # Playwright documentation
│   ├── testim/             # Testim documentation
│   ├── mabl/               # Mabl documentation
│   └── testwise/           # TestWise documentation
│
├── scripts/                 # Utility scripts
│   ├── ingest_kb.py        # Knowledge base ingestion
│   └── run_ingest.sh        # Ingestion script
│
├── public/                  # Public assets
├── dist/                    # Production build output
└── package.json             # Frontend dependencies
```

## 📡 API Documentation

### Backend API Endpoints

Base URL: `http://localhost:3001/api`

#### Authentication

**POST** `/auth/register`
- Register a new user
- Body: `{ email, password, username?, organizationName? }`
- Returns: `{ message, user }`

**POST** `/auth/login`
- Login user
- Body: `{ email, password }`
- Returns: `{ message, user }`

**GET** `/auth/user/:id`
- Get user by ID
- Returns: `{ user }`

**PATCH** `/auth/user/:id/theme`
- Update user theme preference
- Body: `{ themePreference: 'light' | 'dark' }`
- Returns: `{ user }`

**POST** `/auth/update-password`
- Update user password
- Body: `{ email, newPassword }`
- Returns: `{ message, user }`

#### Evaluations

**POST** `/evaluations`
- Create a new evaluation
- Body: `{ userId, projectName?, recommendedTool, scores, answers }`
- Returns: `{ message, evaluation }`

**GET** `/evaluations/user/:userId?limit=50`
- Get all evaluations for a user
- Query: `limit` (optional, default: 50)
- Returns: `{ evaluations[], count }`

**GET** `/evaluations/:id`
- Get evaluation by ID
- Returns: `{ evaluation }`

**DELETE** `/evaluations/:id`
- Delete an evaluation
- Body: `{ userId }`
- Returns: `{ message }`

### RAG Backend API Endpoints

Base URL: `http://localhost:8000`

**POST** `/chat`
- Send a question to the chatbot
- Body: `{ question: string, tool_filter?: string[] }`
- Returns: `{ answer: string, sources: string[], confidence: string }`

**GET** `/kb/manifest`
- Get knowledge base manifest
- Returns: `{ manifest: Array<{id, tool, title, source_file, url}> }`

**POST** `/feedback`
- Submit feedback on a response
- Body: `{ id: string, correct: boolean, notes?: string }`
- Returns: `{ message: string }`

## 🗄️ Database

### Schema

#### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT,
  username TEXT,
  organization_name TEXT,
  is_guest INTEGER DEFAULT 0,
  theme_preference TEXT DEFAULT 'light',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Evaluations Table
```sql
CREATE TABLE evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  project_name TEXT,
  recommended_tool TEXT NOT NULL,
  selenium_score REAL NOT NULL,
  playwright_score REAL NOT NULL,
  testim_score REAL NOT NULL,
  mabl_score REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Answers Table
```sql
CREATE TABLE answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evaluation_id INTEGER NOT NULL,
  question_id TEXT NOT NULL,
  question_category TEXT NOT NULL,
  selected_value TEXT NOT NULL,
  selected_option_text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evaluation_id) REFERENCES evaluations(id)
);
```

### Database Management

**Initialize Database:**
```bash
cd backend-server
npm run init-db
```

**Clear All Data:**
```bash
cd backend-server
npm run clear-db        # Clear database only
npm run clear-all       # Clear database + show Firebase instructions
```

**Check Database Status:**
```bash
cd backend-server
npm run check-all
```

## Authentication

TestWise supports multiple authentication methods:

### 1. Firebase Authentication (Recommended)
- Email/password authentication
- Email verification
- Password reset functionality
- Secure token-based sessions

### 2. Backend Database Authentication
- Primary authentication method
- Bcrypt password hashing
- Session-based authentication

### 3. Guest Mode
- No authentication required
- Local storage only
- Limited functionality

### Authentication Flow

1. User signs up → Account created in database
2. If Firebase configured → Firebase account created + verification email sent
3. User logs in → Backend validates credentials
4. Session created → User data stored in sessionStorage
5. Protected routes → Check authentication state

### User Management

**Clear All Users:**
```bash
# Windows
clear-all-users.bat

# Manual
cd backend-server
npm run clear-all
```

**Clear Firebase Users:**
```bash
cd backend-server
npm run clear-firebase
```
(Requires Firebase Admin SDK setup)

## 🛠️ Scripts & Utilities

### Frontend Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Scripts

```bash
cd backend-server
npm run dev          # Start with auto-reload
npm start            # Start production server
npm run init-db      # Initialize database
npm run migrate      # Run database migrations
npm run clear-db     # Clear all database data
npm run clear-all    # Clear database + show instructions
npm run clear-firebase # Clear Firebase users
npm run check-all    # Check database status
npm run verify-db    # Verify database integrity
```

### Utility Scripts

**Knowledge Base Ingestion:**
```bash
python scripts/ingest_kb.py --dir kb
```

**Start Scripts (Windows):**
- `start-auth-backend.bat` - Start backend server
- `start-rag-backend.bat` - Start RAG backend
- `clear-all-users.bat` - Clear all user data

##  Deployment

### Frontend Deployment

#### Vercel/Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables from `.env`

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

### Backend Deployment

#### Railway/Render
1. Connect repository
2. Set start command: `cd backend-server && npm start`
3. Add environment variables
4. Database will be created automatically

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend-server/package*.json ./
RUN npm ci
COPY backend-server/ .
EXPOSE 3001
CMD ["npm", "start"]
```

### RAG Backend Deployment

#### Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY backend-rag/requirements.txt .
RUN pip install -r requirements.txt
COPY backend-rag/ .
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:
- Frontend: `VITE_API_URL`, Firebase config
- Backend: `PORT`
- RAG Backend: `OPENAI_API_KEY`

## Troubleshooting

### Common Issues

**Frontend won't start:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Backend connection error:**
- Ensure backend is running on port 3001
- Check `VITE_API_URL` in `.env`
- Verify CORS is enabled

**Database errors:**
```bash
cd backend-server
npm run init-db  # Reinitialize database
```

**RAG chatbot not working:**
- Verify OpenAI API key is set
- Ensure knowledge base is ingested: `python scripts/ingest_kb.py --dir kb`
- Check vector store exists in `backend-rag/data/`

**Firebase authentication issues:**
- Verify Firebase config in `.env`
- Check Firebase Console for project settings
- Ensure Email/Password auth is enabled

**Login redirects to home page:**
- Clear browser cache
- Check sessionStorage for `testwise_user`
- Verify authentication state in React DevTools

### Getting Help

1. Check the [Issues](https://github.com/YOUR_USERNAME/testwise/issues) page
2. Review the logs in browser console and terminal
3. Verify all environment variables are set correctly
4. Ensure all services are running

##  Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Express.js](https://expressjs.com/) - Backend framework
- [FastAPI](https://fastapi.tiangolo.com/) - Python API framework
- [OpenAI](https://openai.com/) - LLM and embeddings
- [Firebase](https://firebase.google.com/) - Authentication

## Contact

For questions, issues, or contributions, please open an issue on GitHub.

---

**Made for the testing community**
