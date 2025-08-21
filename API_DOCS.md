# API Documentation

## Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy environment variables: `cp .env.example .env`
4. Set up the database: `npm run setup-db`
5. Start the server: `npm start`

The API will be available at `http://localhost:3000`

### Base URL
All API endpoints are prefixed with `/v1`:
```
http://localhost:3000/v1
```

## Authentication

The API uses JSON Web Tokens (JWT) for authentication. After logging in or registering, include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

- **Authenticated users**: 100 requests per 15 minutes
- **Unauthenticated users**: 20 requests per 15 minutes  
- **Authentication endpoints**: 5 requests per 15 minutes

Rate limit information is included in response headers:
- `RateLimit-Limit`: Request limit for the time window
- `RateLimit-Remaining`: Remaining requests in current window
- `RateLimit-Reset`: Time when the rate limit resets

## API Endpoints

### Users

#### POST /v1/users
Create a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john.doe@example.com",
  "password": "secure_password",
  "full_name": "John Doe", // optional
  "bio": "Lover of coffee and code.", // optional
  "profile_picture_url": "https://example.com/avatar.jpg" // optional
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "john_doe",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "bio": "Lover of coffee and code.",
    "profile_picture_url": "https://example.com/avatar.jpg",
    "followers_count": 0,
    "following_count": 0,
    "createdAt": "2024-01-10T10:00:00.000Z",
    "updatedAt": "2024-01-10T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /v1/users/login
Authenticate a user.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "secure_password"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "john_doe",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "bio": "Lover of coffee and code.",
    "profile_picture_url": "https://example.com/avatar.jpg",
    "followers_count": 150,
    "following_count": 30,
    "createdAt": "2024-01-10T10:00:00.000Z",
    "updatedAt": "2024-01-10T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET /v1/users/:userId
Get a user's public profile.

**Authentication:** Optional

**Response (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "john_doe",
  "full_name": "John Doe",
  "bio": "Lover of coffee and code.",
  "profile_picture_url": "https://example.com/avatar.jpg",
  "followers_count": 1500,
  "following_count": 300,
  "createdAt": "2024-01-10T10:00:00.000Z",
  "updatedAt": "2024-01-10T10:00:00.000Z"
}
```

### Posts

#### GET /v1/posts
Get a list of posts with pagination.

**Authentication:** Optional

**Query Parameters:**
- `limit` (integer, optional, default: 20, max: 100): Number of posts to return
- `offset` (integer, optional, default: 0): Number of posts to skip

**Response (200 OK):**
```json
{
  "posts": [
    {
      "id": "post123",
      "content": "This is my first post!",
      "image_url": "https://example.com/image.jpg",
      "likes_count": 42,
      "comments_count": 5,
      "user_id": "user123",
      "createdAt": "2024-02-15T12:30:00.000Z",
      "updatedAt": "2024-02-15T12:30:00.000Z",
      "author": {
        "id": "user123",
        "username": "some_user",
        "profile_picture_url": "https://example.com/avatar.jpg"
      }
    }
  ],
  "pagination": {
    "next_offset": 20,
    "limit": 20,
    "offset": 0
  }
}
```

#### POST /v1/posts
Create a new post.

**Authentication:** Required

**Request Body:**
```json
{
  "content": "Loving the new API design!",
  "image_url": "https://example.com/image.jpg" // optional
}
```

**Response (201 Created):**
```json
{
  "id": "post123",
  "content": "Loving the new API design!",
  "image_url": "https://example.com/image.jpg",
  "likes_count": 0,
  "comments_count": 0,
  "user_id": "user123",
  "createdAt": "2024-02-15T12:30:00.000Z",
  "updatedAt": "2024-02-15T12:30:00.000Z",
  "author": {
    "id": "user123",
    "username": "current_user",
    "profile_picture_url": "https://example.com/avatar.jpg"
  }
}
```

#### GET /v1/posts/:postId
Get a specific post.

**Authentication:** Optional

**Response (200 OK):**
```json
{
  "id": "post123",
  "content": "This is a specific post!",
  "image_url": "https://example.com/image.jpg",
  "likes_count": 42,
  "comments_count": 5,
  "user_id": "user123",
  "createdAt": "2024-02-15T12:30:00.000Z",
  "updatedAt": "2024-02-15T12:30:00.000Z",
  "author": {
    "id": "user123",
    "username": "some_user",
    "profile_picture_url": "https://example.com/avatar.jpg"
  }
}
```

#### DELETE /v1/posts/:postId
Delete a post (only the post owner can delete).

**Authentication:** Required

**Response (204 No Content)**

### Comments

#### GET /v1/posts/:postId/comments
Get comments for a specific post.

**Authentication:** Optional

**Query Parameters:**
- `limit` (integer, optional, default: 20, max: 100): Number of comments to return
- `offset` (integer, optional, default: 0): Number of comments to skip

**Response (200 OK):**
```json
{
  "comments": [
    {
      "id": "comment123",
      "text": "Great post!",
      "user_id": "user456",
      "post_id": "post123",
      "createdAt": "2024-02-15T13:00:00.000Z",
      "updatedAt": "2024-02-15T13:00:00.000Z",
      "author": {
        "id": "user456",
        "username": "another_user",
        "profile_picture_url": "https://example.com/avatar2.jpg"
      }
    }
  ],
  "pagination": {
    "next_offset": 20,
    "limit": 20,
    "offset": 0
  }
}
```

#### POST /v1/posts/:postId/comments
Add a comment to a post.

**Authentication:** Required

**Request Body:**
```json
{
  "text": "This is a great point!"
}
```

**Response (201 Created):**
```json
{
  "id": "comment123",
  "text": "This is a great point!",
  "user_id": "user456",
  "post_id": "post123",
  "createdAt": "2024-02-15T13:00:00.000Z",
  "updatedAt": "2024-02-15T13:00:00.000Z",
  "author": {
    "id": "user456",
    "username": "current_user",
    "profile_picture_url": "https://example.com/avatar.jpg"
  }
}
```

#### DELETE /v1/posts/:postId/comments/:commentId
Delete a comment (only the comment owner can delete).

**Authentication:** Required

**Response (204 No Content)**

## Error Responses

All errors follow a consistent format:

```json
{
  "error": "Error message",
  "details": ["Additional error details"]
}
```

### HTTP Status Codes

- `200 OK` - Successful GET request
- `201 Created` - Successful POST request (resource created)
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Invalid request data/validation error
- `401 Unauthorized` - Authentication required or invalid token
- `403 Forbidden` - Access denied (insufficient permissions)
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists (e.g., duplicate username/email)
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Example Usage

### 1. Register a new user
```bash
curl -X POST http://localhost:3000/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com", 
    "password": "securepassword123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securepassword123"
  }'
```

### 3. Create a post (using the token from login)
```bash
curl -X POST http://localhost:3000/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "My first post via API!"
  }'
```

### 4. Get posts
```bash
curl "http://localhost:3000/v1/posts?limit=5&offset=0"
```

### 5. Add a comment
```bash
curl -X POST http://localhost:3000/v1/posts/POST_ID/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "text": "Great post!"
  }'
```