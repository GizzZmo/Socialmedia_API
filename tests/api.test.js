const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/database');
// const { _User, _Post, _Comment } = require('../src/models');

describe('Social Media API', () => {
  let authToken;
  let userId;
  let postId;

  beforeAll(async () => {
    // Set up test database
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('User Registration and Authentication', () => {
    test('should register a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
      };

      const response = await request(app)
        .post('/v1/users')
        .send(userData)
        .expect(201);

      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body).toHaveProperty('token');

      userId = response.body.user.id;
      authToken = response.body.token;
    });

    test('should not register user with existing email', async () => {
      const userData = {
        username: 'testuser2',
        email: 'test@example.com',
        password: 'password123',
      };

      await request(app).post('/v1/users').send(userData).expect(409);
    });

    test('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/v1/users/login')
        .send(loginData)
        .expect(200);

      expect(response.body.user).toHaveProperty('id');
      expect(response.body).toHaveProperty('token');
    });

    test('should not login with invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await request(app).post('/v1/users/login').send(loginData).expect(401);
    });
  });

  describe('Posts', () => {
    test('should create a new post', async () => {
      const postData = {
        content: 'This is a test post',
        image_url: 'https://example.com/test.jpg',
      };

      const response = await request(app)
        .post('/v1/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.content).toBe(postData.content);
      expect(response.body.image_url).toBe(postData.image_url);
      expect(response.body.author.username).toBe('testuser');

      postId = response.body.id;
    });

    test('should not create post without authentication', async () => {
      const postData = {
        content: 'This should fail',
      };

      await request(app).post('/v1/posts').send(postData).expect(401);
    });

    test('should get list of posts', async () => {
      const response = await request(app).get('/v1/posts').expect(200);

      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.posts)).toBe(true);
      expect(response.body.posts.length).toBeGreaterThan(0);
    });

    test('should get specific post', async () => {
      const response = await request(app)
        .get(`/v1/posts/${postId}`)
        .expect(200);

      expect(response.body.id).toBe(postId);
      expect(response.body.content).toBe('This is a test post');
    });

    test('should delete own post', async () => {
      await request(app)
        .delete(`/v1/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });

  describe('Comments', () => {
    beforeAll(async () => {
      // Create a new post for comment tests
      const postData = {
        content: 'Post for comment testing',
      };

      const response = await request(app)
        .post('/v1/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData);

      postId = response.body.id;
    });

    test('should add comment to post', async () => {
      const commentData = {
        text: 'This is a test comment',
      };

      const response = await request(app)
        .post(`/v1/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.text).toBe(commentData.text);
      expect(response.body.author.username).toBe('testuser');
    });

    test('should get comments for post', async () => {
      const response = await request(app)
        .get(`/v1/posts/${postId}/comments`)
        .expect(200);

      expect(response.body).toHaveProperty('comments');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.comments)).toBe(true);
      expect(response.body.comments.length).toBeGreaterThan(0);
    });

    test('should not add comment without authentication', async () => {
      const commentData = {
        text: 'This should fail',
      };

      await request(app)
        .post(`/v1/posts/${postId}/comments`)
        .send(commentData)
        .expect(401);
    });
  });

  describe('User Profile', () => {
    test('should get user profile', async () => {
      const response = await request(app)
        .get(`/v1/users/${userId}`)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.username).toBe('testuser');
      expect(response.body).not.toHaveProperty('password');
    });

    test('should return 404 for non-existent user', async () => {
      await request(app).get('/v1/users/non-existent-id').expect(404);
    });
  });

  describe('Validation', () => {
    test('should validate user registration data', async () => {
      const invalidData = {
        username: 'ab', // too short
        email: 'invalid-email',
        password: '123', // too short
      };

      await request(app).post('/v1/users').send(invalidData).expect(400);
    });

    test('should validate post creation data', async () => {
      const invalidData = {
        content: '', // empty content
      };

      await request(app)
        .post('/v1/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('API Health', () => {
    test('should return health status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    test('should return API info at root', async () => {
      const response = await request(app).get('/').expect(200);

      expect(response.body.message).toBe('Social Media API');
      expect(response.body.version).toBe('v1');
      expect(response.body.status).toBe('running');
    });
  });

  describe('Likes', () => {
    test('should like a post', async () => {
      const response = await request(app)
        .post(`/v1/posts/${postId}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.message).toBe('Post liked successfully');
    });

    test('should not like the same post twice', async () => {
      await request(app)
        .post(`/v1/posts/${postId}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(409);
    });

    test('should get post likes', async () => {
      const response = await request(app)
        .get(`/v1/posts/${postId}/likes`)
        .expect(200);

      expect(response.body).toHaveProperty('likes');
      expect(Array.isArray(response.body.likes)).toBe(true);
      expect(response.body.likes.length).toBeGreaterThan(0);
    });

    test('should unlike a post', async () => {
      await request(app)
        .delete(`/v1/posts/${postId}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    test('should not unlike a post that was not liked', async () => {
      await request(app)
        .delete(`/v1/posts/${postId}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Follows', () => {
    let secondUserId;

    beforeAll(async () => {
      // Create a second user with a unique email
      const timestamp = Date.now();
      const userData = {
        username: `seconduser${timestamp}`,
        email: `second${timestamp}@example.com`,
        password: 'password123',
        full_name: 'Second User',
      };

      // Wait a bit to avoid rate limiting
      await new Promise((resolve) => global.setTimeout(resolve, 100));

      const response = await request(app)
        .post('/v1/users')
        .send(userData)
        .expect(201);

      secondUserId = response.body.user.id;
    });

    test('should follow a user', async () => {
      const response = await request(app)
        .post(`/v1/users/${secondUserId}/follow`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.message).toBe('User followed successfully');
    });

    test('should not follow the same user twice', async () => {
      await request(app)
        .post(`/v1/users/${secondUserId}/follow`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(409);
    });

    test('should not follow yourself', async () => {
      await request(app)
        .post(`/v1/users/${userId}/follow`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    test('should get user followers', async () => {
      const response = await request(app)
        .get(`/v1/users/${secondUserId}/followers`)
        .expect(200);

      expect(response.body).toHaveProperty('followers');
      expect(Array.isArray(response.body.followers)).toBe(true);
      expect(response.body.followers.length).toBe(1);
    });

    test('should get user following', async () => {
      const response = await request(app)
        .get(`/v1/users/${userId}/following`)
        .expect(200);

      expect(response.body).toHaveProperty('following');
      expect(Array.isArray(response.body.following)).toBe(true);
      expect(response.body.following.length).toBe(1);
    });

    test('should unfollow a user', async () => {
      await request(app)
        .delete(`/v1/users/${secondUserId}/follow`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    test('should not unfollow a user that was not followed', async () => {
      await request(app)
        .delete(`/v1/users/${secondUserId}/follow`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Feed', () => {
    test('should get user feed', async () => {
      const response = await request(app)
        .get('/v1/feed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('posts');
      expect(Array.isArray(response.body.posts)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    test('should require authentication for feed', async () => {
      await request(app).get('/v1/feed').expect(401);
    });
  });
});
