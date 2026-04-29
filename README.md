# MedSecure - Secure Medical Record System

Sistem medical record yang aman dengan autentikasi berbasis role, blockchain verification untuk medical records, audit logging, dan security monitoring.

## 🏗️ Architecture

Sistem terdiri dari 2 bagian utama:

1. **Frontend** - React + TypeScript + Tailwind CSS
2. **Backend** - Node.js + Express + MongoDB + TypeScript

## 🎯 Fitur Utama

### Authentication & Security
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, Doctor, Nurse)
- ✅ Account lockout setelah 5 failed login attempts
- ✅ Security event logging
- ✅ Audit trail untuk semua actions
- ✅ Rate limiting
- ✅ Password hashing dengan bcrypt

### Patient Management
- ✅ CRUD operations untuk patient records
- ✅ Patient demographics & contact info
- ✅ Blood type tracking
- ✅ Last visit tracking

### Medical Records
- ✅ Create medical records (Doctor only)
- ✅ Blockchain hash verification (SHA-256)
- ✅ Diagnosis, symptoms, prescription tracking
- ✅ Lab results storage
- ✅ Tamper detection

### Vital Signs
- ✅ Input vital signs (Nurse)
- ✅ Blood pressure, heart rate, temperature
- ✅ Oxygen saturation, respiratory rate
- ✅ Weight & height tracking

### Admin Features
- ✅ User management (create, update, delete, unlock)
- ✅ Audit log viewing dengan filtering
- ✅ Security events monitoring
- ✅ System health monitoring
- ✅ Statistics & analytics

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.x
- MongoDB (local atau MongoDB Atlas)
- pnpm (recommended) atau npm

### 1. Clone Repository

```bash
git clone <repository-url>
cd medsecure
```

### 2. Setup Backend

```bash
cd backend
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env dan sesuaikan dengan konfigurasi Anda

# Seed database dengan demo data
pnpm seed

# Run backend server
pnpm dev
```

Backend akan berjalan di `http://localhost:5000`

### 3. Setup Frontend

```bash
cd ..  # kembali ke root directory
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env jika perlu (default sudah OK untuk development)

# Run frontend
pnpm dev
```

Frontend akan berjalan di `http://localhost:5173`

### 4. Access Application

Buka browser dan akses `http://localhost:5173`

## 🔑 Demo Credentials

Setelah seeding, gunakan credentials berikut untuk login:

| Role   | Email                  | Password   |
|--------|------------------------|------------|
| Doctor | nicholai@doctor.com    | nicholai123 |
| Nurse  | nurse@medical.com      | nurse123   |
| Admin  | admin@medical.com      | admin123   |

## 📁 Project Structure

```
medsecure/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # Request handlers
│   │   ├── models/            # MongoDB models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth & other middleware
│   │   ├── utils/             # Utility functions
│   │   └── server.ts          # Main entry point
│   ├── .env                   # Environment variables
│   └── package.json
│
├── src/                       # Frontend
│   ├── app/
│   │   ├── components/        # Reusable components
│   │   ├── context/           # React context (Auth)
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── routes.tsx         # React Router configuration
│   │   └── App.tsx            # Main app component
│   ├── imports/               # Medical system flow spec
│   └── styles/                # Tailwind CSS
│
├── .env                       # Frontend env variables
├── package.json               # Frontend dependencies
└── README.md                  # This file
```

## 🔗 API Endpoints

Dokumentasi lengkap API endpoints tersedia di `backend/README.md`

### Main Endpoints:

```
Authentication
POST   /api/auth/login          - Login
POST   /api/auth/register       - Register (Admin only)
GET    /api/auth/me             - Get current user
PUT    /api/auth/password       - Update password

Patients
GET    /api/patients            - Get all patients
POST   /api/patients            - Create patient
GET    /api/patients/:id        - Get patient by ID
PUT    /api/patients/:id        - Update patient
DELETE /api/patients/:id        - Delete patient

Medical Records
GET    /api/medical-records     - Get all records (Admin)
POST   /api/medical-records     - Create record (Doctor)
POST   /api/medical-records/verify - Verify blockchain hash

Audit Logs
GET    /api/audit-logs          - Get audit logs (Admin)
GET    /api/audit-logs/stats    - Get statistics (Admin)

Security Events
GET    /api/security-events     - Get events (Admin)
GET    /api/security-events/stats - Get statistics (Admin)

Vital Signs
GET    /api/vital-signs         - Get all vital signs
POST   /api/vital-signs         - Create vital sign

Users
GET    /api/users               - Get all users (Admin)
PUT    /api/users/:id           - Update user (Admin)
DELETE /api/users/:id           - Delete user (Admin)
PUT    /api/users/:id/unlock    - Unlock account (Admin)
```

## 🎨 Tech Stack

### Frontend
- React 18
- TypeScript
- React Router 7
- Tailwind CSS v4
- Radix UI components
- Lucide React icons
- Date-fns
- Recharts (untuk monitoring graphs)

### Backend
- Node.js
- Express
- TypeScript
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs (password hashing)
- Helmet (security headers)
- CORS
- Express Rate Limit

## 🔒 Security Features

1. **Authentication**
   - JWT tokens dengan expiration
   - Password hashing dengan bcrypt (10 rounds)
   - Token verification pada setiap protected route

2. **Authorization**
   - Role-based access control
   - Route-level protection
   - Frontend route guards

3. **Brute Force Protection**
   - 5 failed login attempts = account lock
   - Security event logging
   - IP address tracking

4. **Data Integrity**
   - Blockchain hash untuk medical records
   - SHA-256 hashing
   - Tamper detection

5. **Security Headers**
   - Helmet.js untuk security headers
   - CORS configuration
   - Rate limiting

6. **Audit Trail**
   - Semua actions di-log
   - User, timestamp, IP address tracking
   - Action type & resource tracking

## 🛠️ Development

### Backend Development

```bash
cd backend

# Watch mode dengan auto-reload
pnpm dev

# Build untuk production
pnpm build

# Run production build
pnpm start

# Seed database
pnpm seed
```

### Frontend Development

```bash
# Development server
pnpm dev

# Build untuk production
pnpm build
```

## 📊 Monitoring & Analytics

Dashboard admin menyediakan:
- Total users & active sessions
- Failed login attempts (hari ini)
- Security events statistics
- Audit log analytics
- System health indicators

## 🧪 Testing

Untuk testing sistem:

1. Login sebagai Doctor untuk:
   - Create/update patients
   - Add medical records
   - View blockchain verification

2. Login sebagai Nurse untuk:
   - Input vital signs
   - View patients
   - View medical history

3. Login sebagai Admin untuk:
   - Manage users
   - View audit logs
   - Monitor security events
   - Access all features

## 📝 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medsecure
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## 🚨 Troubleshooting

### Backend tidak connect ke MongoDB
- Pastikan MongoDB sudah running
- Check MONGODB_URI di .env
- Jika pakai MongoDB Atlas, pastikan IP sudah di-whitelist

### Frontend tidak bisa connect ke backend
- Pastikan backend sudah running di port 5000
- Check VITE_API_URL di frontend .env
- Check CORS configuration di backend

### Account terkunci
- Login sebagai Admin
- Ke User Management
- Click "Unlock" pada user yang terkunci

## 📄 License

ISC

## 👥 Support

Untuk bantuan atau pertanyaan, silakan buat issue di repository ini.
