# Social Media API - Quick Reference

## New Endpoints Added

### ❤️ Likes

- `POST /v1/posts/:postId/like` - Like a post
- `DELETE /v1/posts/:postId/like` - Unlike a post  
- `GET /v1/posts/:postId/likes` - Get post likes (with pagination)

### 🤝 Follows

- `POST /v1/users/:userId/follow` - Follow a user
- `DELETE /v1/users/:userId/follow` - Unfollow a user
- `GET /v1/users/:userId/followers` - Get user's followers (with pagination)
- `GET /v1/users/:userId/following` - Get users followed by user (with pagination)

### 📰 Feed

- `GET /v1/feed` - Get personalized feed (requires authentication)

## Quick Start with Docker

```bash
# Build and run with Docker
npm run docker:build
npm run docker:run

# Or use Docker Compose
npm run docker:compose
```

## Development Commands

```bash
# Code quality
npm run lint          # Check code style
npm run lint:fix       # Fix linting issues
npm run format         # Format code with Prettier

# Testing
npm test              # Run all tests (32 total)

# Development
npm run dev           # Start with nodemon
npm run setup-db      # Initialize database with sample data
```

## Features

✅ **Like System**: Users can like/unlike posts  
✅ **Follow System**: Users can follow/unfollow each other  
✅ **Personalized Feed**: Get posts from followed users  
✅ **Structured Logging**: Winston logger with different levels  
✅ **Request Compression**: Gzip compression for better performance  
✅ **HTTP Logging**: Morgan middleware for request logging  
✅ **Code Quality**: ESLint + Prettier configuration  
✅ **Docker Support**: Production-ready containerization  
✅ **Rate Limiting**: Different limits for authenticated/unauthenticated users  
✅ **Comprehensive Testing**: 32 passing tests

## Example Usage

### Like a Post
```bash
curl -X POST http://localhost:3000/v1/posts/POST_ID/like \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Follow a User
```bash
curl -X POST http://localhost:3000/v1/users/USER_ID/follow \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Personalized Feed
```bash
curl http://localhost:3000/v1/feed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## API Response Format

All responses follow consistent patterns:

```json
{
  "posts": [...],
  "pagination": {
    "next_offset": 20,
    "limit": 20,
    "offset": 0
  }
}
```

For complete API documentation, see `API_DOCS.md`.