# Silver Bay Seafoods Safety Manager

A comprehensive, enterprise-grade safety management system for seafood processing facilities.

## 🎯 Overview

This is a full-stack application designed specifically for Silver Bay Seafoods to manage safety assessments, incident reporting, training, and compliance tracking across multiple facilities.

## ✨ Features

### Core Functionality
- **Job Safety Analysis (JSA)** - Department-specific hazard assessments with pre-loaded Ketchikan JSA data
- **LOTO Assessments** - Complete lockout/tagout compliance tracking
- **Injury/Incident Reporting** - Comprehensive incident documentation
- **Auto Accident Reports** - Vehicle accident tracking
- **Spill/Release Reports** - Environmental incident reporting
- **Monthly Inspections** - Facility hygiene and safety checks
- **Action Items** - Corrective action tracking with assignments
- **Training Management** - Session scheduling and attendance tracking
- **SDS Library** - Chemical safety data sheet management

### Technical Features
- 🔐 Secure authentication with JWT
- 👥 Role-based access control (Admin, Manager, Supervisor, User)
- 📱 Responsive design for iPad/tablet use
- 📷 Camera integration for photo evidence
- 📄 PDF generation for all forms
- 💾 Offline-capable with local storage
- 🔄 SharePoint sync ready
- 📊 Real-time dashboard and analytics

## 🏗️ Architecture

### Backend (Node.js/Express)
```
backend/
├── src/
│   ├── config/          # Configuration (DB, env, constants)
│   ├── controllers/     # Request handlers
│   ├── models/          # Data models
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth, validation, error handling
│   ├── services/        # Business logic
│   ├── utils/           # Helpers and utilities
│   └── data/            # Static data (JSA departments, PPE options)
├── tests/               # Unit and integration tests
└── scripts/             # Database initialization and migrations
```

### Frontend (React)
```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── auth/        # Login, Register, ProtectedRoute
│   │   ├── layout/      # Sidebar, Header, MainLayout
│   │   ├── forms/       # All form components (JSA, LOTO, etc.)
│   │   ├── common/      # Shared components (Button, Input, etc.)
│   │   └── features/    # Feature-specific components
│   ├── pages/           # Page components
│   ├── contexts/        # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API calls and storage
│   ├── utils/           # Utility functions
│   └── data/            # Static data and constants
```

### Database (SQLite)
```
database/
├── schema.sql           # Complete database schema
├── migrations/          # Database migration scripts
└── seeds/               # Sample data for development
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm or yarn
- Modern web browser

### Installation

1. **Clone or extract the project**
   ```bash
   cd seafood-safety-app
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run init-db
   npm run dev
   ```

3. **Setup Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Default login: `admin` / `Admin123!`

## 📖 Documentation

- [API Documentation](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [User Guide](docs/USER_GUIDE.md)

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon
npm test             # Run tests
npm run lint         # Lint code
```

### Frontend Development
```bash
cd frontend
npm start            # Start development server
npm test             # Run tests
npm run build        # Build for production
```

### Database Management
```bash
cd backend
npm run init-db      # Initialize database
npm run seed         # Seed sample data
npm run migrate      # Run migrations
```

## 📦 Project Structure

```
seafood-safety-app/
├── backend/                 # Node.js/Express API
├── frontend/                # React application
├── database/                # Database schema and migrations
├── docs/                    # Documentation
├── docker-compose.yml       # Docker configuration
├── Dockerfile               # Docker image definition
└── README.md               # This file
```

## 🔒 Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- Input validation on all forms
- SQL injection prevention
- XSS protection
- CORS configuration
- Role-based access control
- Audit logging

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Run all tests
npm run test:all
```

## 📱 Department-Specific JSA

The application includes pre-loaded JSA data from the Ketchikan facility:

**Departments:**
- Case Up (Lifts, Block Flipper, Pan Return, Glaze Feeder, Bag Feed, Labeler, Block Stitcher, Block Labeler, Loading Dock Tally)
- IQF Case Up (Forklift Operator, IQF Breakout, IQF Tote Loaders, Tote Builder, IQF Case Up Tally)

Each department includes:
- Specific job steps
- Associated hazards
- Required controls
- PPE requirements

## 🚢 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd backend
NODE_ENV=production npm start
```

### Docker Deployment
```bash
docker-compose up -d
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## 📄 License

Proprietary - Silver Bay Seafoods, LLC

## 👥 Support

For technical support, contact the IT department.

## 🔄 Version History

- **v1.0.0** (2026-02-10) - Initial release
  - Complete authentication system
  - All safety forms (JSA, LOTO, Injury, Accident, Spill, Inspection)
  - Department-specific JSA with Ketchikan data
  - Action item tracking
  - Training management
  - SDS library
  - PDF generation
  - Role-based access control

---

**Built with ❤️ for Silver Bay Seafoods**
