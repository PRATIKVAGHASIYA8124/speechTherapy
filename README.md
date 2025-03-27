# Speech Language Therapy Management System

A comprehensive MERN stack application for managing speech language therapy clinical services.

## Features

- User Authentication (Therapists and Supervisors)
- Patient Management
- Therapy Plan Creation and Management
- Progress Report System
- Clinical Evaluation and Rating System
- Feedback System

## Tech Stack

- Frontend: React.js
- Backend: Node.js + Express.js
- Database: MongoDB
- Authentication: JWT

## Project Structure

```
speech-therapy-system/
├── client/                 # React frontend
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── middleware/       # Custom middleware
└── README.md
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd client
   npm start
   ```

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/profile - Get user profile

### Patients
- GET /api/patients - Get all patients
- POST /api/patients - Create new patient
- GET /api/patients/:id - Get patient details
- PUT /api/patients/:id - Update patient details
- DELETE /api/patients/:id - Delete patient

### Therapy Plans
- POST /api/therapy-plans - Create therapy plan
- GET /api/therapy-plans - Get all therapy plans
- GET /api/therapy-plans/:id - Get therapy plan details
- PUT /api/therapy-plans/:id - Update therapy plan
- POST /api/therapy-plans/:id/approve - Approve therapy plan

### Progress Reports
- POST /api/progress-reports - Create progress report
- GET /api/progress-reports - Get all progress reports
- GET /api/progress-reports/:id - Get progress report details
- PUT /api/progress-reports/:id - Update progress report
- POST /api/progress-reports/:id/approve - Approve progress report

### Clinical Ratings
- POST /api/ratings - Create clinical rating
- GET /api/ratings - Get all ratings
- GET /api/ratings/:id - Get rating details
- PUT /api/ratings/:id - Update rating 