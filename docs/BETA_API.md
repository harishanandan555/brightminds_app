# Beta Program API Documentation

## Overview
Endpoints for managing the Beta Program participation flow. All endpoints require JWT Bearer Token authentication.

### User Model Addition
```javascript
// Add to existing User schema
{
  betaProgram: {
    hasAccepted:         { type: Boolean, default: false },
    hasDeclined:         { type: Boolean, default: false },
    acceptedAt:          { type: Date, default: null },
    declinedAt:          { type: Date, default: null },
    hasSeenConfirmation: { type: Boolean, default: false },
    ipAddress:           { type: String, default: null },
    userAgent:           { type: String, default: null }
  }
}
```

---

## Endpoints

### 1. POST `/api/v1/beta/accept`

| Field   | Detail                                    |
|---------|-------------------------------------------|
| Auth    | Required (JWT Bearer Token)               |
| Purpose | Record user's acceptance of beta terms    |

**Request:** No body required (user identified via JWT)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Beta program terms accepted successfully.",
  "data": {
    "userId": "64a1b2c3d4e5f6a7b8c9d0e1",
    "betaProgram": {
      "hasAccepted": true,
      "acceptedAt": "2026-02-10T13:17:00.000Z",
      "hasSeenConfirmation": false
    }
  }
}
```

**Error Responses:**

| Status | Scenario                              |
|--------|---------------------------------------|
| 401    | Not authenticated                     |
| 409    | User has already accepted or declined |
| 500    | Internal server error                 |

---

### 2. POST `/api/v1/beta/decline`

| Field   | Detail                                |
|---------|---------------------------------------|
| Auth    | Required (JWT Bearer Token)           |
| Purpose | Record user's decline; block access   |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "You have declined. Login access is blocked for the beta program.",
  "data": {
    "userId": "64a1b2c3d4e5f6a7b8c9d0e1",
    "betaProgram": {
      "hasDeclined": true,
      "declinedAt": "2026-02-10T13:18:00.000Z"
    }
  }
}
```

**Error Responses:**

| Status | Scenario                              |
|--------|---------------------------------------|
| 401    | Not authenticated                     |
| 409    | User has already accepted or declined |
| 500    | Internal server error                 |

---

### 3. GET `/api/v1/beta/status`

| Field   | Detail                                  |
|---------|-----------------------------------------|
| Auth    | Required (JWT Bearer Token)             |
| Purpose | Check user's beta acceptance status     |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "hasAccepted": true,
    "hasDeclined": false,
    "hasSeenConfirmation": true
  }
}
```

---

### 4. PATCH `/api/v1/beta/confirmation-seen`

| Field   | Detail                                                       |
|---------|--------------------------------------------------------------|
| Auth    | Required (JWT Bearer Token)                                  |
| Purpose | Mark confirmation page as viewed (ensures one-time display)  |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Confirmation page marked as seen.",
  "data": {
    "hasSeenConfirmation": true
  }
}
```

**Error Responses:**

| Status | Scenario                                    |
|--------|---------------------------------------------|
| 401    | Not authenticated                           |
| 400    | User hasn't accepted beta terms yet         |
| 500    | Internal server error                       |
