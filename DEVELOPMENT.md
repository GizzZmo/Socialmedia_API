# Social Media API - Development Guide

## Project Overview

This is a complete implementation of the Social Media API described in the README.md specification. The project follows modern REST API best practices and includes all the core features outlined in the original blueprint.

## Architecture

### Technology Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite with Sequelize ORM
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: Joi
- **Testing**: Jest + Supertest
- **Security**: Helmet, CORS, bcrypt for password hashing

### Project Structure
```
src/
├── app.js                 # Main application entry point
├── config/
│   └── database.js        # Database configuration
├── models/
│   ├── index.js          # Model associations
│   ├── User.js           # User model
│   ├── Post.js           # Post model
│   ├── Comment.js        # Comment model
│   ├── Like.js           # Like model
│   └── Follow.js         # Follow model
├── routes/
│   ├── users.js          # User endpoints
│   ├── posts.js          # Post endpoints
│   └── comments.js       # Comment endpoints
├── middleware/
│   ├── auth.js           # Authentication middleware
│   ├── rateLimiting.js   # Rate limiting middleware
│   ├── validation.js     # Input validation middleware
│   └── errorHandler.js   # Error handling middleware
└── setup/
    └── database.js       # Database setup script
```

## Features Implemented

### ✅ Core Requirements from README.md

- **RESTful Architecture**: All endpoints follow REST principles
- **JSON-Based**: All data exchange in JSON format
- **Stateless**: No server-side session storage
- **Security**: JWT authentication, password hashing, HTTPS-ready
- **Scalability**: Pagination support, rate limiting

### ✅ Data Models

- **User**: Complete user management with profile information
- **Post**: Content sharing with image support
- **Comment**: Threaded commenting system
- **Like**: Post appreciation (model ready for future implementation)
- **Follow**: User relationship management (model ready for future implementation)

### ✅ API Endpoints

**Users:**
- `POST /v1/users` - User registration
- `POST /v1/users/login` - User authentication
- `GET /v1/users/:userId` - Get user profile

**Posts:**
- `GET /v1/posts` - List posts with pagination
- `POST /v1/posts` - Create new post (authenticated)
- `GET /v1/posts/:postId` - Get specific post
- `DELETE /v1/posts/:postId` - Delete post (owner only)

**Comments:**
- `GET /v1/posts/:postId/comments` - List comments with pagination
- `POST /v1/posts/:postId/comments` - Add comment (authenticated)
- `DELETE /v1/posts/:postId/comments/:commentId` - Delete comment (owner only)

### ✅ Additional Features

- **Rate Limiting**: Different limits for authenticated/unauthenticated users
- **API Versioning**: All endpoints under `/v1/`
- **Input Validation**: Comprehensive validation using Joi
- **Error Handling**: Consistent error response format
- **Health Checks**: `/health` endpoint for monitoring
- **Database Setup**: Automated setup with sample data
- **Test Suite**: Comprehensive API tests

## Quick Start

### Development Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd Socialmedia_API
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env if needed (defaults work for development)
   ```

3. **Database Setup**
   ```bash
   npm run setup-db
   ```

4. **Start Development Server**
   ```bash
   npm run dev  # with auto-reload
   # or
   npm start    # production mode
   ```

5. **Run Tests**
   ```bash
   npm test
   ```

### API Testing

The API will be available at `http://localhost:3000/v1`

**Quick Test Sequence:**

1. **Register a user:**
   ```bash
   curl -X POST http://localhost:3000/v1/users \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
   ```

2. **Login (save the token):**
   ```bash
   curl -X POST http://localhost:3000/v1/users/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

3. **Create a post:**
   ```bash
   curl -X POST http://localhost:3000/v1/posts \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -d '{"content":"Hello World!"}'
   ```

4. **Get posts:**
   ```bash
   curl http://localhost:3000/v1/posts
   ```

## Sample Data

The `npm run setup-db` command creates three test users:

- **john_doe** (john.doe@example.com) / password123
- **jane_smith** (jane.smith@example.com) / password123  
- **mike_johnson** (mike.johnson@example.com) / password123

Along with sample posts, comments, and follow relationships.

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: 7-day expiry tokens
- **Rate Limiting**: 
  - Authenticated: 100 req/15min
  - Unauthenticated: 20 req/15min
  - Auth endpoints: 5 req/15min
- **Input Validation**: All inputs validated with Joi
- **SQL Injection Protection**: Sequelize ORM parameterized queries
- **CORS**: Configurable cross-origin requests
- **Helmet**: Security headers

## Deployment Considerations

### Environment Variables
```bash
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DB_PATH=./database.sqlite
NODE_ENV=production
API_VERSION=v1
```

### Production Checklist
- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper database (PostgreSQL/MySQL for production)
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure proper CORS origins
- [ ] Set up logging and monitoring
- [ ] Configure process manager (PM2)
- [ ] Set up backup strategy for database

### Scaling Considerations
- Database connection pooling
- Horizontal scaling with load balancer
- Redis for session management (if moving away from JWT)
- CDN for image assets
- Caching layer for frequently accessed data

## Extension Points

The codebase is designed for easy extension:

### Planned Features (Models Ready)
- **Like System**: Like/unlike posts
- **Follow System**: Follow/unfollow users
- **User Feed**: Personalized post feed
- **Notifications**: Real-time notifications
- **Search**: Full-text search for posts/users

### Additional Features to Consider
- **Image Upload**: Direct image upload handling
- **Real-time Chat**: WebSocket integration
- **Content Moderation**: Automated content filtering
- **Analytics**: User engagement metrics
- **Admin Panel**: Content management interface

## Contributing

### Code Style
- ESLint configuration for consistent code style
- Sequelize naming conventions (snake_case for DB, camelCase for JS)
- RESTful endpoint naming
- Comprehensive error handling

### Testing
- Unit tests for all models
- Integration tests for all endpoints
- Test coverage reporting
- Automated testing in CI/CD

### Documentation
- API documentation in `API_DOCS.md`
- Code comments for complex business logic
- README updates for new features

## Support

For questions or issues:
1. Check the API documentation in `API_DOCS.md`
2. Review the test cases in `tests/api.test.js`
3. Examine the sample data creation in `src/setup/database.js`
4. Create an issue in the repository