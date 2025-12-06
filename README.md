# 🎶 H25-SIM-Eq4 — MusicAI Studio (Harmonia)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://h25-sim-eq4.vercel.app)

MusicAI Studio (Harmonia) is an interactive full-stack web application that enables users to create accounts, authenticate, and compose music using artificial intelligence. The application provides a comprehensive suite of tools for music creation, sound analysis, and recording management.

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Functionality
- **User Authentication**: Secure sign up and login system with JWT tokens
- **Music Composition**: Interactive piano interface for composing music
- **AI-Powered Suggestions**: Get intelligent music composition recommendations
- **Sound Analysis**: Real-time audio analysis and visualization using advanced algorithms
- **Recording Management**: Save, retrieve, update, and delete your musical compositions
- **User Settings**: Customize your profile and application preferences
- **Responsive Design**: Fully responsive interface that works on desktop and mobile devices

### Technical Features
- Real-time audio processing using Essentia.js and Meyda
- Audio visualization with interactive waveforms
- MongoDB integration for persistent data storage
- JWT-based authentication and authorization
- RESTful API architecture
- Modern React with TypeScript
- Server-side rendering support with Vite

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React icons, Framer Motion animations
- **Audio Processing**: 
  - Essentia.js - Audio analysis and feature extraction
  - Meyda - Real-time audio feature extraction
  - ML5.js - Machine learning for audio
  - Pitchy - Pitch detection
- **State Management**: React hooks and local storage
- **Authentication**: Supabase client integration
- **HTTP Client**: Native fetch API

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express 5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment Management**: dotenv
- **Text Processing**: Natural (NLP library)
- **CORS**: Configured for cross-origin requests

### Development Tools
- **TypeScript**: Static type checking
- **ESLint**: Code linting and quality
- **ts-node**: TypeScript execution for development

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- **MongoDB** (local instance or MongoDB Atlas account)
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/sozenka/H25-SIM-Eq4.git
cd H25-SIM-Eq4
```

### 2. Install Root Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/harmonia
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/harmonia

# JWT Secret (use a strong, random string)
JWT_SECRET=your_secure_jwt_secret_key_here
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory if you need to configure additional settings:

```env
# API Base URL (optional, defaults to localhost:5000)
VITE_API_URL=http://localhost:5000
```

**Note**: The frontend uses Supabase for some services. The configuration is in `frontend/supabaseClient.ts`.

## 🎯 Usage

### Development Mode

#### Start the Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

#### Start the Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Building for Production

#### Build Frontend

```bash
cd frontend
npm run build
```

#### Build Backend

```bash
cd backend
npm run build
```

#### Start Production Server

```bash
cd backend
npm start
```

## 📡 API Documentation

### Authentication Endpoints

#### Sign Up
- **POST** `/api/auth/signup`
- **Body**: `{ "email": "user@example.com", "password": "password123", "username": "username" }`
- **Response**: `{ "token": "jwt_token", "user": { "id", "email", "username" } }`

#### Login
- **POST** `/api/auth/login`
- **Body**: `{ "email": "user@example.com", "password": "password123" }`
- **Response**: `{ "token": "jwt_token", "user": { "id", "email", "username" } }`

### Recording Endpoints

All recording endpoints require authentication via JWT token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

#### Create Recording
- **POST** `/api/recordings`
- **Body**: `{ "name": "My Song", "notes": [...], "duration": 120, "audioPath": "path/to/audio" }`
- **Response**: `{ "recording": { "id", "name", "notes", "duration", "audioPath", "userId", "createdAt" } }`

#### Get All Recordings
- **GET** `/api/recordings`
- **Response**: `{ "recordings": [...] }`

#### Update Recording
- **PATCH** `/api/recordings/:id`
- **Body**: `{ "name": "Updated Name" }`
- **Response**: `{ "recording": {...} }`

#### Delete Recording
- **DELETE** `/api/recordings/:id`
- **Response**: `{ "message": "Recording deleted" }`

### User Endpoints

#### Update User Profile
- **PATCH** `/api/user/update`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "username": "newUsername", "email": "newemail@example.com" }`
- **Response**: `{ "user": {...} }`

### Health Check

#### Health Status
- **GET** `/health`
- **Response**: `{ "status": "OK" }`

## 📁 Project Structure

```
H25-SIM-Eq4/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   │   ├── AudioVisualizer.tsx
│   │   │   ├── AuthModal.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── Piano.tsx
│   │   │   └── RecordingControls.tsx
│   │   ├── pages/             # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Composition.tsx
│   │   │   ├── AiSuggestions.tsx
│   │   │   ├── SoundAnalysis.tsx
│   │   │   ├── Recordings.tsx
│   │   │   └── Settings.tsx
│   │   ├── store/             # State management
│   │   ├── utils/             # Utility functions
│   │   ├── App.tsx            # Main application component
│   │   └── main.tsx           # Application entry point
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.ts         # Vite configuration
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   └── tsconfig.json          # TypeScript configuration
├── backend/                    # Express backend server
│   ├── src/
│   │   └── lib/
│   │       ├── api/           # API route handlers
│   │       │   └── auth.ts    # Authentication logic
│   │       └── mongodb.ts     # MongoDB models and utilities
│   ├── server.ts              # Express server setup
│   ├── package.json           # Backend dependencies
│   └── tsconfig.json          # TypeScript configuration
├── package.json               # Root package.json for serverless
├── LICENSE                    # MIT License
└── README.md                  # This file
```

## 🔧 Development

### Code Style

The project uses ESLint for code quality. Run linting:

```bash
# Frontend
cd frontend
npm run lint

# Backend (if configured)
cd backend
npm run lint
```

### Available Scripts

#### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

#### Backend Scripts
- `npm run dev` - Start development server with ts-node
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server

## 🚀 Deployment

### Live Demo

The application is deployed and accessible at: **https://h25-sim-eq4.vercel.app**

### Frontend Deployment (Vercel)

The frontend is configured for Vercel deployment:
1. Push your changes to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically deploy on push to main branch

Configuration file: `frontend/vercel.json`

### Backend Deployment (Render)

The backend is configured for Render deployment:
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set environment variables in Render dashboard
4. Deploy

Configuration file: `backend/render.yaml`

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **sozenka** - [GitHub Profile](https://github.com/sozenka)

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the intersection of music and AI
- Thanks to all contributors and the open-source community

## 📞 Support

For support, issues, or feature requests, please:
- Open an issue on [GitHub](https://github.com/sozenka/H25-SIM-Eq4/issues)
- Visit the live demo at [https://h25-sim-eq4.vercel.app](https://h25-sim-eq4.vercel.app)

---

Made with ❤️ by the H25-SIM-Eq4 team
