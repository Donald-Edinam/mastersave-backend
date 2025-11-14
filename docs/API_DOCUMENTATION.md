# MasterSave API Documentation

## Overview

The MasterSave API is a comprehensive financial management system designed for students with role-based access control. It provides endpoints for user authentication, profile management, transaction tracking, budgeting, and administrative oversight.

## Base URL

```
http://localhost:5000
```

## Interactive Documentation

Visit the interactive Swagger documentation at:
```
http://localhost:5000/api-docs
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## User Roles

- **STUDENT**: Regular users who can manage their own financial data
- **ADMIN**: Administrative users who can oversee all student activities

## API Endpoints

### Health Check

#### GET /health
Basic health check endpoint to verify service status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-11-14T10:00:00.000Z",
  "uptime": 3600
}
```

### Authentication

#### POST /auth/signup
Register a new user account.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT",
  "university": "University of Example",
  "city": "Example City",
  "currency": "USD",
  "stipendAmount": 1500,
  "disbursementFrequency": "monthly",
  "savingsGoalPct": 20
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "student@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STUDENT",
      "createdAt": "2025-11-14T10:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "student@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STUDENT",
      "profile": {
        "university": "University of Example",
        "city": "Example City",
        "currency": "USD",
        "stipendAmount": 1500,
        "disbursementFrequency": "monthly",
        "savingsGoalPct": 20
      }
    },
    "token": "jwt_token_here"
  }
}
```

#### GET /auth/me
Get current user profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "student@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STUDENT",
      "profile": {
        "university": "University of Example",
        "city": "Example City",
        "currency": "USD",
        "stipendAmount": 1500,
        "disbursementFrequency": "monthly",
        "savingsGoalPct": 20
      },
      "transactions": [],
      "budgets": []
    }
  }
}
```

### Admin Endpoints

All admin endpoints require authentication and ADMIN role.

#### GET /admin/dashboard
Get administrative dashboard statistics.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalStudents": 25,
      "totalTransactions": 150,
      "totalBudgets": 30,
      "activeNudges": 5,
      "totalSpending": 12500.50
    },
    "recentTransactions": [
      {
        "id": "transaction_id",
        "category": "Food",
        "amount": 25.50,
        "description": "Lunch",
        "date": "2025-11-14T12:00:00.000Z",
        "user": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "student@example.com"
        }
      }
    ]
  }
}
```

#### GET /admin/students
Get list of all students.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "student_id",
        "email": "student@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "STUDENT",
        "profile": {
          "university": "University of Example",
          "city": "Example City",
          "currency": "USD",
          "stipendAmount": 1500
        },
        "transactions": [],
        "budgets": [],
        "_count": {
          "transactions": 10,
          "budgets": 2,
          "nudges": 1
        }
      }
    ],
    "total": 25
  }
}
```

#### GET /admin/students/{studentId}
Get detailed information about a specific student.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Parameters:**
- `studentId` (path): Student's unique identifier

**Response (200):**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": "student_id",
      "email": "student@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STUDENT",
      "profile": {
        "university": "University of Example",
        "city": "Example City",
        "currency": "USD",
        "stipendAmount": 1500,
        "disbursementFrequency": "monthly",
        "savingsGoalPct": 20
      },
      "transactions": [],
      "budgets": [],
      "nudges": []
    }
  }
}
```

#### PUT /admin/students/{studentId}/profile
Update a student's profile information.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Parameters:**
- `studentId` (path): Student's unique identifier

**Request Body:**
```json
{
  "university": "Updated University",
  "city": "Updated City",
  "currency": "EUR",
  "stipendAmount": 2000,
  "disbursementFrequency": "bi-weekly",
  "savingsGoalPct": 25,
  "lockedSavings": 500,
  "weeks": 4
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Student profile updated successfully",
  "data": {
    "profile": {
      "id": "profile_id",
      "userId": "student_id",
      "university": "Updated University",
      "city": "Updated City",
      "currency": "EUR",
      "stipendAmount": 2000,
      "disbursementFrequency": "bi-weekly",
      "savingsGoalPct": 25,
      "lockedSavings": 500,
      "weeks": 4
    }
  }
}
```

### Database Testing

#### GET /test-db
Test database connection.

**Response (200):**
```json
{
  "success": true,
  "message": "Database connection successful",
  "data": {
    "timestamp": "2025-11-14T10:00:00.000Z",
    "database": "neondb"
  }
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message",
  "error": "Detailed error information"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required",
  "error": "Invalid or missing token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions.",
  "error": "Admin role required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "error": "User/Student not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "User already exists with this email",
  "error": "Duplicate resource"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Detailed error message"
}
```

## Data Models

### User
```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "STUDENT | ADMIN",
  "provider": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Profile
```json
{
  "id": "string",
  "userId": "string",
  "university": "string",
  "city": "string",
  "currency": "string",
  "stipendAmount": "number",
  "disbursementFrequency": "string",
  "savingsGoalPct": "number",
  "lockedSavings": "number",
  "weeks": "number",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Transaction
```json
{
  "id": "string",
  "userId": "string",
  "category": "string",
  "amount": "number",
  "description": "string",
  "date": "datetime"
}
```

### Budget
```json
{
  "id": "string",
  "userId": "string",
  "weekNumber": "number",
  "totalBudget": "number",
  "spentAmount": "number",
  "startDate": "datetime",
  "endDate": "datetime",
  "isActive": "boolean"
}
```

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## CORS

CORS is enabled for all origins in development. Configure appropriately for production.

## Security Considerations

1. **JWT Tokens**: Tokens expire in 7 days by default
2. **Password Hashing**: Uses bcrypt with 12 salt rounds
3. **Role-Based Access**: Admin endpoints are protected by role middleware
4. **Input Validation**: All endpoints validate required fields
5. **Error Handling**: Sensitive information is not exposed in error messages

## Testing

Use the provided test scripts:
- `test-auth.js` - Test authentication endpoints
- `test-roles.js` - Test role-based access control

## Support

For API support, contact the development team or refer to the interactive documentation at `/api-docs`.