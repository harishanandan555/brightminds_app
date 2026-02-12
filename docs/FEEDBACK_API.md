# Feedback API Documentation

## Overview
The Feedback API allows users to submit feedback, bug reports, feature requests, and general comments about the application.

## Base URL
```
/api/v1/feedback
```

## Endpoints

### Submit Feedback

Submit user feedback to the system.

**Endpoint:** `POST /api/v1/feedback`

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "string",           // Required. One of: "general", "bug", "feature", "improvement", "question"
  "rating": "number",          // Optional. Integer 1-5 representing user satisfaction
  "message": "string",         // Required. The feedback message (min 10 characters)
  "email": "string",           // Optional. Contact email (defaults to authenticated user's email)
  "allowContact": "boolean"    // Optional. Whether user allows follow-up contact (default: false)
}
```

**Example Request:**
```json
{
  "type": "bug",
  "rating": 3,
  "message": "The project save button sometimes doesn't respond on first click. I have to click it twice to save my changes.",
  "email": "teacher@school.edu",
  "allowContact": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "type": "bug",
    "rating": 3,
    "message": "The project save button sometimes doesn't respond on first click...",
    "email": "teacher@school.edu",
    "allowContact": true,
    "userRole": "teacher",
    "userId": "696decf727d3d5bee8adc252",
    "status": "pending",
    "createdAt": "2026-02-07T09:00:00.000Z",
    "updatedAt": "2026-02-07T09:00:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid input
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "message",
      "message": "Feedback message is required and must be at least 10 characters"
    }
  ]
}
```

**401 Unauthorized** - Missing or invalid token
```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```

**500 Internal Server Error** - Server error
```json
{
  "success": false,
  "message": "Failed to submit feedback"
}
```

---

### List All Feedback (Admin Only)

Retrieve all feedback submitted by users. **Superadmin access required.**

**Endpoint:** `GET /api/v1/feedback`

**Authentication:** Required (Bearer token, superadmin role)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Items per page (max: 100) |
| `type` | string | — | Filter: `general`, `bug`, `feature`, `improvement`, `question` |
| `status` | string | — | Filter: `pending`, `reviewed`, `in-progress`, `resolved`, `closed` |

**Example Request:**
```
GET /api/v1/feedback?page=1&limit=10&type=bug&status=pending
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "feedback": [
      {
        "id": "507f1f77bcf86cd799439011",
        "type": "bug",
        "rating": 3,
        "message": "The project save button sometimes doesn't respond...",
        "email": "teacher@school.edu",
        "userRole": "teacher",
        "status": "pending",
        "createdAt": "2026-02-07T09:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 48,
      "itemsPerPage": 10
    }
  }
}
```

**Error Responses:**

**403 Forbidden** - Not a superadmin
```json
{
  "success": false,
  "message": "Access denied. Superadmin role required."
}
```

---

### Get User's Feedback (Optional - for future implementation)

Retrieve all feedback submitted by the authenticated user.

**Endpoint:** `GET /api/v1/feedback/my-feedback`

**Authentication:** Required (Bearer token)

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10, max: 50)
- `type` (optional): Filter by feedback type

**Example Request:**
```
GET /api/v1/feedback/my-feedback?page=1&limit=10&type=bug
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "feedback": [
      {
        "id": "507f1f77bcf86cd799439011",
        "type": "bug",
        "rating": 3,
        "message": "The project save button sometimes doesn't respond...",
        "status": "resolved",
        "response": "Thank you for reporting this. We've fixed the issue in version 1.2.0",
        "createdAt": "2026-02-07T09:00:00.000Z",
        "updatedAt": "2026-02-08T14:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

---

## Data Models

### Feedback Schema

```javascript
{
  id: ObjectId,                    // Auto-generated MongoDB ID
  userId: ObjectId,                // Reference to User model
  userRole: String,                // User's role: "teacher" | "parent" | "admin"
  type: String,                    // "general" | "bug" | "feature" | "improvement" | "question"
  rating: Number,                  // 1-5 (optional)
  message: String,                 // Required, min 10 characters
  email: String,                   // Contact email
  allowContact: Boolean,           // Default: false
  status: String,                  // "pending" | "reviewed" | "in-progress" | "resolved" | "closed"
  response: String,                // Admin response (optional)
  respondedBy: ObjectId,           // Reference to admin who responded (optional)
  respondedAt: Date,               // When admin responded (optional)
  createdAt: Date,                 // Auto-generated
  updatedAt: Date                  // Auto-generated
}
```

### Validation Rules

- **type**: Required. Must be one of: "general", "bug", "feature", "improvement", "question"
- **rating**: Optional. Must be integer between 1-5
- **message**: Required. Minimum 10 characters, maximum 2000 characters
- **email**: Optional. Must be valid email format if provided
- **allowContact**: Optional. Boolean, defaults to false

---

## Frontend Integration Example

```javascript
import api from './axios';

export const submitFeedback = async (feedbackData) => {
  const response = await api.post('/feedback', {
    type: feedbackData.type,
    rating: feedbackData.rating,
    message: feedbackData.message,
    email: feedbackData.email,
    allowContact: feedbackData.allowContact
  });
  return response.data;
};

// Usage in component
const handleSubmitFeedback = async () => {
  try {
    const result = await submitFeedback({
      type: 'bug',
      rating: 4,
      message: 'Found an issue with...',
      email: 'user@example.com',
      allowContact: true
    });
    console.log('Feedback submitted:', result);
  } catch (error) {
    console.error('Failed to submit feedback:', error);
  }
};
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- The `userId` and `userRole` are automatically extracted from the authentication token
- Feedback is stored for analytics and product improvement
- Users will receive email confirmation if `allowContact` is true and a valid email is provided
- Admin dashboard (future feature) will allow viewing and responding to feedback

