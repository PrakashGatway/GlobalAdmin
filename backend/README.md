# C-way Global Admin Backend API

Backend API for C-way Global Admin Dashboard built with Node.js, Express, and MongoDB.

## Features

- RESTful API endpoints
- JWT Authentication
- MongoDB database with Mongoose
- User management
- Wallet management
- Universities, Courses, Programs management
- Countries management
- Support ticket system

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
- MongoDB connection string
- JWT secret key
- Port number

## Running the Server

### Development mode (with nodemon):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users` - Get all users (protected)
- `GET /api/users/:id` - Get single user (protected)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Wallets
- `GET /api/wallets` - Get all wallets (protected)
- `GET /api/wallets/user/:userId` - Get user wallets (protected)
- `POST /api/wallets` - Create wallet (protected)
- `PUT /api/wallets/:id` - Update wallet (protected)
- `DELETE /api/wallets/:id` - Delete wallet (protected)

### Universities
- `GET /api/universities` - Get all universities (protected)
- `GET /api/universities/:id` - Get single university (protected)
- `POST /api/universities` - Create university (protected)
- `PUT /api/universities/:id` - Update university (protected)
- `DELETE /api/universities/:id` - Delete university (protected)

### Courses
- `GET /api/courses` - Get all courses (protected)
- `GET /api/courses/:id` - Get single course (protected)
- `POST /api/courses` - Create course (protected)
- `PUT /api/courses/:id` - Update course (protected)
- `DELETE /api/courses/:id` - Delete course (protected)

### Programs
- `GET /api/programs` - Get all programs (protected)
- `GET /api/programs/:id` - Get single program (protected)
- `POST /api/programs` - Create program (protected)
- `PUT /api/programs/:id` - Update program (protected)
- `DELETE /api/programs/:id` - Delete program (protected)

### Countries
- `GET /api/countries` - Get all countries (protected)
- `GET /api/countries/:id` - Get single country (protected)
- `POST /api/countries` - Create country (protected)
- `PUT /api/countries/:id` - Update country (protected)
- `DELETE /api/countries/:id` - Delete country (protected)

### Support
- `GET /api/support` - Get all tickets (protected)
- `GET /api/support/:id` - Get single ticket (protected)
- `POST /api/support` - Create ticket (protected)
- `PUT /api/support/:id` - Update ticket (protected)
- `DELETE /api/support/:id` - Delete ticket (protected)

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## Database Models

- **User**: User accounts with authentication
- **Wallet**: User wallet balances and transactions
- **University**: University information
- **Course**: Course details linked to universities
- **Program**: Academic programs linked to universities
- **Country**: Country information
- **Support**: Support ticket system

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - Token expiration time
- `NODE_ENV` - Environment (development/production)
