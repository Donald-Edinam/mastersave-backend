# Authentication Implementation Documentation

## Overview

This document provides comprehensive documentation for the JWT-based authentication system implemented in the MasterSave Backend API. The system uses bcrypt for password hashing and JSON Web Tokens (JWT) for stateless authentication.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Dependencies](#dependencies)
3. [Environment Configuration](#environment-configuration)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Security Implementation](#security-implementation)
7. [Middleware](#middleware)
8. [Error Handling](#error-handling)
9. [Testing](#testing)
10. [Usage Examples](#usage-examples)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

## Architecture Overview

The authentication system follows a stateless JWT-based approach with the following components:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client App    │───▶│   Auth Routes    │───▶│  Auth Controller│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │ Auth Middleware  │    │   Prisma ORM    │
                       └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   JWT Service    │    │  PostgreSQL DB  │
                       └──────────────────┘    └─────────────────┘
```

### Key Components:

- **Auth Controller**: Handles signup, login, and user profile retrieval
- **Auth Middleware**: Validates JWT tokens for protected routes
- **JWT Service**: Token generation and verification
- **Password Hashing**: Secure password storage using bcrypt
- **Database Integration**: User management via Prisma ORM

## Dependencies

### Production Dependencies
```json
{
  "bcrypt": "^5.1.1",           // Password hashing
  "jsonwebtoken": "^9.0.2",    // JWT token management
  "@prisma/client": "^6.19.0", // Database ORM
  "express": "^4.21.2"         // Web framework
}
```

### Development Dependencies
```json
{
  "axios": "^1.7.7"            // HTTP client for testing
}
```

## Environment Configuration

### Required Environment Variables

```env
# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database"

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Security Considerations

- **JWT_SECRET**: Must be a strong, randomly generated secret (minimum 32 characters)
- **JWT_EXPIRES_IN**: Token expiration time (recommended: 7d for development, 1h for production)
- **DATABASE_URL**: Should use SSL in production environments

## Database Schema

### User Model
```prisma
model User {
  id            String        @id @default(cuid())
  email         String        @unique
  firstName     String
  lastName      String
  password      String?       // Optional for OAuth users
  provider      String        @default("email")
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  profile       Profile?
  transactions  Transaction[]
  budgets       Budget[]
  nudges        Nudge[]
}
```

### Profile Model
```prisma
model Profile {
  id             String   @id @default(cuid())
  userId         String   @unique
  university     String
  city           String
  totalStipend   Float
  savingsGoalPct Float    // Savings goal percentage
  lockedSavings  Float    @default(0)
  weeks          Int      @default(4)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  user           User     @relation(fields: [userId], references: [id])
}
```

## API Endpoints

### 1. User Registration

**Endpoint:** `POST /auth/signup`

**Description:** Creates a new user account with optional profile information.

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",                    // Required
  "lastName": "Doe",                      // Required
  "password": "securePassword123",
  "university": "Harvard University",     // Optional
  "city": "Cambridge",                    // Optional
  "totalStipend": 2000.00,               // Optional
  "savingsGoalPct": 25.0                 // Optional
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "clxy123abc",
      "email": "user@example.com",
      "provider": "email",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "profile": {
        "id": "clxy456def",
        "userId": "clxy123abc",
        "university": "Harvard University",
        "city": "Cambridge",
        "totalStipend": 2000.00,
        "savingsGoalPct": 25.0,
        "lockedSavings": 0,
        "weeks": 4,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400`: Missing required fields (email, firstName, lastName, password)
- `409`: User already exists
- `500`: Internal server error

### 2. User Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticates user credentials and returns JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clxy123abc",
      "email": "user@example.com",
      "provider": "email",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "profile": { /* profile data */ }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid credentials
- `500`: Internal server error

### 3. Get Current User

**Endpoint:** `GET /auth/me`

**Description:** Retrieves current user information (protected route).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clxy123abc",
      "email": "user@example.com",
      "provider": "email",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "profile": { /* profile data */ },
      "transactions": [ /* last 10 transactions */ ],
      "budgets": [ /* active budgets */ ]
    }
  }
}
```

**Error Responses:**
- `401`: Missing, invalid, or expired token
- `404`: User not found
- `500`: Internal server error

## Security Implementation

### Password Hashing

```javascript
const bcrypt = require('bcrypt');

// Hashing during signup
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verification during login
const isPasswordValid = await bcrypt.compare(password, user.password);
```

**Security Features:**
- Salt rounds: 12 (recommended for production)
- Automatic salt generation
- Timing-safe comparison

### JWT Token Management

```javascript
const jwt = require('jsonwebtoken');

// Token generation
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Token verification
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

**Token Payload:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "iat": 1642234567,
  "exp": 1642839367
}
```

## Middleware

### Authentication Middleware

**File:** `src/middlewares/authMiddleware.js`

**Purpose:** Validates JWT tokens for protected routes.

**Implementation:**
```javascript
const authMiddleware = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    // Handle various JWT errors
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};
```

**Usage:**
```javascript
// Apply to protected routes
router.get('/me', authMiddleware, getMe);
```

## Error Handling

### Authentication Errors

| Error Type | Status Code | Description |
|------------|-------------|-------------|
| Missing Token | 401 | No Authorization header provided |
| Invalid Format | 401 | Authorization header doesn't start with "Bearer " |
| Invalid Token | 401 | JWT signature verification failed |
| Expired Token | 401 | JWT token has expired |
| User Not Found | 404 | User ID from token doesn't exist in database |

### Validation Errors

| Error Type | Status Code | Description |
|------------|-------------|-------------|
| Missing Fields | 400 | Required fields (email, password) not provided |
| User Exists | 409 | Email already registered |
| Invalid Credentials | 401 | Email or password incorrect |

## Testing

### Automated Test Script

**File:** `test-auth.js`

**Run Tests:**
```bash
node test-auth.js
```

**Test Coverage:**
1. ✅ User signup with valid data
2. ✅ User login with valid credentials
3. ✅ Protected route access with valid token
4. ✅ Invalid token rejection
5. ✅ Missing token rejection

### Manual Testing with cURL

**1. Signup:**
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "password123",
    "university": "Test University",
    "city": "Test City",
    "totalStipend": 1500,
    "savingsGoalPct": 25
  }'
```

**2. Login:**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**3. Protected Route:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/auth/me
```

## Usage Examples

### Frontend Integration (JavaScript)

```javascript
class AuthService {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  async signup(userData) {
    // userData should include: email, firstName, lastName, password
    const response = await fetch(`${this.baseURL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (data.success) {
      this.token = data.data.token;
      localStorage.setItem('authToken', this.token);
    }
    
    return data;
  }

  async login(email, password) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (data.success) {
      this.token = data.data.token;
      localStorage.setItem('authToken', this.token);
    }
    
    return data;
  }

  async getCurrentUser() {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${this.baseURL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    return response.json();
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  isAuthenticated() {
    return !!this.token;
  }
}

// Usage
const auth = new AuthService();

// Signup
await auth.signup({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  password: 'password123',
  university: 'MIT',
  city: 'Boston'
});

// Login
await auth.login('user@example.com', 'password123');

// Get current user
const user = await auth.getCurrentUser();
```

### React Hook Example

```javascript
import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      setToken(data.data.token);
      setUser(data.data.user);
      localStorage.setItem('authToken', data.data.token);
    }

    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## Best Practices

### Security Best Practices

1. **Environment Variables:**
   - Use strong, randomly generated JWT secrets
   - Never commit secrets to version control
   - Use different secrets for different environments

2. **Password Security:**
   - Minimum password length: 8 characters
   - Use bcrypt with salt rounds ≥ 12
   - Consider password complexity requirements

3. **Token Management:**
   - Use short expiration times in production (1-24 hours)
   - Implement token refresh mechanism for longer sessions
   - Store tokens securely on the client side

4. **HTTPS:**
   - Always use HTTPS in production
   - Secure cookie settings for token storage
   - Implement HSTS headers

### Development Best Practices

1. **Error Handling:**
   - Don't expose sensitive information in error messages
   - Log security events for monitoring
   - Use consistent error response format

2. **Validation:**
   - Validate all input data
   - Sanitize user inputs
   - Use schema validation libraries

3. **Testing:**
   - Write comprehensive tests for all auth flows
   - Test edge cases and error conditions
   - Use automated security testing tools

## Troubleshooting

### Common Issues

**1. "Invalid token" errors:**
- Check if JWT_SECRET matches between token generation and verification
- Verify token hasn't expired
- Ensure proper Bearer token format

**2. "User already exists" during signup:**
- Check if email is already registered
- Implement proper error handling for duplicate emails

**3. Database connection issues:**
- Verify DATABASE_URL is correct
- Check if database is running and accessible
- Ensure Prisma client is properly initialized

**4. Password comparison fails:**
- Verify bcrypt version compatibility
- Check if password was properly hashed during signup
- Ensure salt rounds match between operations

### Debug Commands

```bash
# Check environment variables
node -e "console.log(process.env.JWT_SECRET)"

# Test database connection
npx prisma db pull

# Verify JWT token
node -e "
const jwt = require('jsonwebtoken');
const token = 'YOUR_TOKEN_HERE';
try {
  console.log(jwt.verify(token, process.env.JWT_SECRET));
} catch (e) {
  console.error(e.message);
}
"
```

### Logging

Add comprehensive logging for debugging:

```javascript
// In authController.js
console.log('Signup attempt:', { email, timestamp: new Date() });
console.log('Login attempt:', { email, success: true, timestamp: new Date() });
console.log('Token verification:', { userId: decoded.id, timestamp: new Date() });
```

## Conclusion

This authentication system provides a secure, scalable foundation for user management in the MasterSave application. It follows industry best practices for password security, token management, and API design while maintaining flexibility for future enhancements.

For additional security considerations in production environments, consider implementing:
- Rate limiting for auth endpoints
- Account lockout mechanisms
- Two-factor authentication
- OAuth integration
- Session management
- Audit logging