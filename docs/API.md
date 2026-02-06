# BrightMinds API Documentation

## Base URL
```
http://localhost:5002/api/v1
```

---

## Progress Item APIs

Progress items track goals and milestones for student projects.

---

### Add Progress Item(s)

Add one or multiple goals/progress items to a project.

**Endpoint:** `POST /projects/{projectId}/progress-item`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| projectId | string | Yes | MongoDB ObjectId of the project |

**Request Body (Single Item):**
```json
{
  "title": "string (required) - Goal or progress item title"
}
```

**Request Body (Multiple Items - Array):**
```json
{
  "items": [
    { "title": "[Short-Term] Improve reading comprehension by 20%" },
    { "title": "[Short-Term] Complete weekly vocabulary exercises" },
    { "title": "[Long-Term] Achieve grade-level reading proficiency" },
    { "title": "[Focus] Phonemic awareness: Practice blending sounds" }
  ]
}
```

**Example Request (Single Item):**
```bash
curl -X POST http://localhost:5002/api/v1/projects/696e1eda7b834887d10571e4/progress-item \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "[Short-Term] Improve reading comprehension by 20%"}'
```

**Example Request (Multiple Items):**
```bash
curl -X POST http://localhost:5002/api/v1/projects/696e1eda7b834887d10571e4/progress-item \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "title": "[Short-Term] Improve reading comprehension by 20%" },
      { "title": "[Long-Term] Achieve grade-level proficiency" }
    ]
  }'
```

**Response (201 Created - Single Item):**
```json
{
  "success": true,
  "progressItem": {
    "id": "abc123",
    "title": "[Short-Term] Improve reading comprehension by 20%",
    "status": "pending",
    "createdAt": "2026-02-05T12:00:00.000Z",
    "updatedAt": "2026-02-05T12:00:00.000Z"
  }
}
```

**Response (201 Created - Multiple Items):**
```json
{
  "success": true,
  "progressItems": [
    {
      "id": "abc123",
      "title": "[Short-Term] Improve reading comprehension by 20%",
      "status": "pending",
      "createdAt": "2026-02-05T12:00:00.000Z"
    },
    {
      "id": "abc124",
      "title": "[Long-Term] Achieve grade-level proficiency",
      "status": "pending",
      "createdAt": "2026-02-05T12:00:00.000Z"
    }
  ],
  "addedCount": 2
}
```

**Error Responses:**
| Status | Description |
|--------|-------------|
| 400 | Invalid request body (missing title or empty items array) |
| 401 | Unauthorized (invalid/missing token) |
| 404 | Project not found |
| 500 | Internal server error |

---

### Update Progress Item

Update an existing progress item (title or status).

**Endpoint:** `PUT /projects/{projectId}/progress-item/{itemId}`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| projectId | string | Yes | MongoDB ObjectId of the project |
| itemId | string | Yes | ID of the progress item |

**Request Body:**
```json
{
  "title": "string (optional) - Updated title",
  "status": "string (optional) - pending | in_progress | completed"
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:5002/api/v1/projects/696e1eda7b834887d10571e4/progress-item/abc123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

**Response (200 OK):**
```json
{
  "success": true,
  "progressItem": {
    "id": "abc123",
    "title": "[Short-Term] Improve reading comprehension by 20%",
    "status": "completed",
    "createdAt": "2026-02-05T12:00:00.000Z",
    "updatedAt": "2026-02-05T14:00:00.000Z"
  }
}
```

---

### Delete Progress Item

Remove a progress item from a project.

**Endpoint:** `DELETE /projects/{projectId}/progress-item/{itemId}`

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| projectId | string | Yes | MongoDB ObjectId of the project |
| itemId | string | Yes | ID of the progress item |

**Example Request:**
```bash
curl -X DELETE http://localhost:5002/api/v1/projects/696e1eda7b834887d10571e4/progress-item/abc123 \
  -H "Authorization: Bearer <token>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Progress item deleted successfully"
}
```

---

## Frontend Usage

### JavaScript/React Example

```javascript
import { addProgressItem, updateProgressItem, deleteProgressItem } from '../api/projectsApi';

// Add a new goal
await addProgressItem(projectId, { title: "[Short-Term] Complete math assessment" });

// Update status to completed
await updateProgressItem(projectId, itemId, { status: "completed" });

// Delete a progress item
await deleteProgressItem(projectId, itemId);
```

---

## Progress Item Status Values

| Status | Description |
|--------|-------------|
| `pending` | Item not yet started (default) |
| `in_progress` | Work in progress |
| `completed` | Goal achieved |

---

## Goal Title Prefixes (Convention)

When adding goals from AI analysis, titles are prefixed for categorization:

| Prefix | Source |
|--------|--------|
| `[Short-Term]` | Short-term goals from analysis |
| `[Long-Term]` | Long-term goals from analysis |
| `[Focus]` | Instructional focus areas from analysis |
