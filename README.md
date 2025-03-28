# Speech Therapy Platform

A comprehensive web application for managing speech therapy sessions, patient records, and therapy plans.

## Features

- User Authentication (Therapists and Supervisors)
- Patient Management
- Therapy Plan Creation and Management
- Progress Reports
- Clinical Ratings
- Email Verification
- Role-based Access Control

## Tech Stack

- Frontend: React.js, Material-UI
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT
- Email Service: Nodemailer

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Gmail Account (for email verification)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/PRATIKVAGHASIYA8124/SpeechTherapy.git
cd SpeechTherapy
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Create a `.env` file in the server directory with the following variables:
```env
# Server Configuration
PORT=5000
MONGODB_URI=mongodb://localhost:27017/speech-therapy
JWT_SECRET=your_jwt_secret_key

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=your-email@gmail.com
CLIENT_URL=http://localhost:3000

# Other Configuration
NODE_ENV=development
```

## Running the Application

1. Start the server:
```bash
cd server
npm start
```

2. Start the client:
```bash
cd client
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
speech-therapy/
├── client/                 # Frontend React application
│   ├── public/
│   └── src/
│       ├── components/    # React components
│       ├── contexts/      # React contexts
│       └── App.js
├── server/                # Backend Node.js application
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   └── server.js
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 