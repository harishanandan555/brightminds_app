# Users API Documentation

## Overview
The Users API provides endpoints for user management. Admin endpoints are restricted to superadmin users.

## Base URL
```
/api/v1/users
```

## Endpoints

### Get Current User Profile

Retrieve the authenticated user's profile.

**Endpoint:** `GET /api/v1/users/me`

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "696decf727d3d5bee8adc252",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "teacher",
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-02-07T09:00:00.000Z"
  }
}
```

---

### List All Users (Admin Only)

Retrieve all users in the system. **Superadmin access required.**

**Endpoint:** `GET /api/v1/users`

**Authentication:** Required (Bearer token, superadmin role)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Items per page (max: 100) |
| `role` | string | — | Filter by role: `teacher`, `parent`, `superadmin` |

**Example Request:**
```
GET /api/v1/users?page=1&limit=10&role=teacher
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "696decf727d3d5bee8adc252",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "teacher",
        "createdAt": "2026-01-15T10:00:00.000Z"
      },
      {
        "id": "696decf727d3d5bee8adc253",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "role": "parent",
        "createdAt": "2026-01-20T14:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 95,
      "itemsPerPage": 10
    }
  }
}
```

**Error Responses:**

**401 Unauthorized** - Missing or invalid token
```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```

**403 Forbidden** - Not a superadmin
```json
{
  "success": false,
  "message": "Access denied. Superadmin role required."
}
```

---

## Data Models

### User Schema

```javascript
{
  id: ObjectId,              // Auto-generated MongoDB ID
  name: String,              // User's display name
  email: String,             // Unique email address
  password: String,          // Hashed password (never returned in API)
  role: String,              // "teacher" | "parent" | "superadmin"
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

### Role Permissions

| Role | Permissions |
|------|-------------|
| `teacher` | Manage own projects, submit feedback |
| `parent` | View children's projects, submit feedback |
| `superadmin` | All permissions + view all users + view all feedback |

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Passwords are never returned in API responses
- Admin endpoints require `superadmin` role
- Pagination defaults: page=1, limit=10
