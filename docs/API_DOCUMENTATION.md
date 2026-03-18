# API Documentation - Silver Bay Safety Manager

## Overview
This is the official API documentation for the Silver Bay Safety Manager backend. The API is built with Express.js and uses RESTful conventions.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints except `/auth/login` and `/auth/register` require authentication via JWT token.

### Request Headers
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

---

## Authentication Endpoints

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (Success - 200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "user",
    "facility": "Main Plant",
    "department": "Processing"
  }
}
```

**Response (Error - 401):**
```json
{
  "error": {
    "message": "Invalid credentials",
    "code": "AUTHENTICATION_ERROR",
    "statusCode": 401,
    "timestamp": "2026-02-11T10:30:00.000Z"
  }
}
```

---

### Register
```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "string (3-50 chars, alphanumeric_)",
  "email": "string (valid email)",
  "password": "string (8+ chars, must include uppercase, lowercase, number, special char)",
  "full_name": "string (2-100 chars)",
  "job_title": "string (optional)",
  "facility": "string (optional)",
  "department": "string (optional)"
}
```

**Response (Success - 201):**
```json
{
  "message": "User registered successfully",
  "userId": 1,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Get Current User
```http
GET /auth/me
```

**Headers Required:** Yes (JWT Token)

**Response (Success - 200):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "role": "user",
  "facility": "Main Plant",
  "department": "Processing",
  "is_active": true,
  "created_at": "2026-02-11T10:00:00.000Z"
}
```

---

### Refresh Token
```http
POST /auth/refresh
```

**Headers Required:** Yes (JWT Token)

**Response (Success - 200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "24h"
}
```

---

## JSA (Job Safety Analysis) Endpoints

### List All JSAs
```http
GET /jsa
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 100)
- `status` (enum: draft, submitted, approved, rejected, archived)
- `facility` (string)
- `department` (string)
- `sort` (string: created_at, updated_at)

**Response (Success - 200):**
```json
{
  "data": [
    {
      "id": 1,
      "facility": "Main Plant",
      "department": "Processing",
      "job_title": "Fish Processor",
      "hazards": ["Sharp objects", "Cold exposure"],
      "controls": ["Cut-resistant gloves", "Warm clothing"],
      "status": "approved",
      "created_by": 1,
      "created_at": "2026-02-11T10:00:00.000Z",
      "updated_at": "2026-02-11T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

---

### Create JSA
```http
POST /jsa
```

**Request Body:**
```json
{
  "facility": "string (required)",
  "department": "string (required)",
  "job_title": "string (required)",
  "hazards": ["string"] (required, min 1 item),
  "controls": ["string"],
  "notes": "string (optional)"
}
```

**Response (Success - 201):**
```json
{
  "id": 5,
  "facility": "Main Plant",
  "department": "Processing",
  "job_title": "Fish Processor",
  "hazards": ["Sharp objects", "Cold exposure"],
  "controls": ["Cut-resistant gloves", "Warm clothing"],
  "status": "draft",
  "created_by": 1,
  "created_at": "2026-02-11T11:00:00.000Z",
  "updated_at": "2026-02-11T11:00:00.000Z"
}
```

---

### Get JSA by ID
```http
GET /jsa/:id
```

**Response (Success - 200):**
```json
{
  "id": 1,
  "facility": "Main Plant",
  "department": "Processing",
  "job_title": "Fish Processor",
  "hazards": ["Sharp objects", "Cold exposure"],
  "controls": ["Cut-resistant gloves", "Warm clothing"],
  "status": "approved",
  "created_by": 1,
  "created_at": "2026-02-11T10:00:00.000Z",
  "updated_at": "2026-02-11T10:00:00.000Z"
}
```

---

### Update JSA
```http
PUT /jsa/:id
```

**Request Body:** (Same as Create, all fields optional)

**Response (Success - 200):**
```json
{
  "message": "JSA updated successfully",
  "id": 1
}
```

---

### Delete JSA
```http
DELETE /jsa/:id
```

**Response (Success - 200):**
```json
{
  "message": "JSA deleted successfully"
}
```

---

### Approve JSA
```http
POST /jsa/:id/approve
```

**Response (Success - 200):**
```json
{
  "message": "JSA approved successfully",
  "id": 1,
  "status": "approved"
}
```

---

### Reject JSA
```http
POST /jsa/:id/reject
```

**Request Body:**
```json
{
  "reason": "string (required, max 500 chars)"
}
```

**Response (Success - 200):**
```json
{
  "message": "JSA rejected successfully",
  "id": 1,
  "status": "rejected",
  "rejection_reason": "Hazards not properly identified"
}
```

---

### Export JSA as PDF
```http
GET /jsa/:id/export-pdf
```

**Response:** PDF file download

---

## Error Handling

### Common Error Codes
| Code | HTTP Status | Description |
|------|------------|-------------|
| `AUTHENTICATION_ERROR` | 401 | Missing or invalid authentication token |
| `AUTHORIZATION_ERROR` | 403 | User lacks permissions for this resource |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `DUPLICATE_ENTRY` | 409 | Unique constraint violation |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Error Response Format
```json
{
  "error": {
    "message": "Descriptive error message",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "timestamp": "2026-02-11T10:30:00.000Z",
    "requestId": "uuid",
    "details": {}
  }
}
```

---

## Rate Limiting

API requests are rate-limited to 100 requests per 15 minutes per IP address.

**Rate Limit Headers:**
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1613136600
```

---

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DATABASE_PATH=./database/safety_manager.db
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

### Frontend (.env)
```
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENV=development
```

---

## Development Scripts

### Backend
```bash
npm install           # Install dependencies
npm run dev          # Start development server with auto-reload
npm run lint         # Run ESLint
npm run lint:fix     # auto-fix linting issues
npm test             # Run tests with coverage
npm test:watch       # Run tests in watch mode
npm run init-db      # Initialize database
```

### Frontend
```bash
npm install           # Install dependencies
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
```

---

## Best Practices

### API Requests
1. Always include proper error handling
2. Use appropriate HTTP methods (GET, POST, PUT, DELETE)
3. Include authentication token in Authorization header
4. Handle rate limiting gracefully
5. Log API errors for debugging

### Response Handling
1. Check status codes before processing data
2. Validate response data structure
3. Handle timeouts gracefully
4. Implement retry logic for failed requests
5. Show user-friendly error messages

### Security
1. Never log sensitive data (passwords, tokens)
2. Validate all input data
3. Use HTTPS in production
4. Rotate JWT secrets regularly
5. Implement proper CORS policies

---

## Support
For API support, contact: api-support@silverbay.com
