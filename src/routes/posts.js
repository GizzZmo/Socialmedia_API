const express = require('express');
const { Post, User } = require('../models');
const { auth, optionalAuth } = require('../middleware/auth');
const { authRateLimit, unauthRateLimit } = require('../middleware/rateLimiting');
const { validate, validateQuery, postCreationSchema, paginationSchema } = require('../middleware/validation');

const router = express.Router();

// GET /posts - Get list of posts
router.get('/',
  unauthRateLimit,
  optionalAuth,
  validateQuery(paginationSchema),
  async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      const posts = await Post.findAll({
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profile_picture_url']
        }],
        order: [['created_at', 'DESC']],
        limit,
        offset
      });

      const hasMore = posts.length === limit;

      res.json({
        posts,
        pagination: {
          ...(hasMore && { next_offset: offset + limit }),
          limit,
          offset
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /posts - Create a new post
router.post('/',
  authRateLimit,
  auth,
  validate(postCreationSchema),
  async (req, res, next) => {
    try {
      const { content, image_url } = req.body;

      const post = await Post.create({
        content,
        image_url,
        user_id: req.user.id
      });

      // Fetch the created post with author information
      const createdPost = await Post.findByPk(post.id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profile_picture_url']
        }]
      });

      res.status(201).json(createdPost);
    } catch (error) {
      next(error);
    }
  }
);

// GET /posts/:postId - Get a specific post
router.get('/:postId',
  unauthRateLimit,
  optionalAuth,
  async (req, res, next) => {
    try {
      const { postId } = req.params;

      const post = await Post.findByPk(postId, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profile_picture_url']
        }]
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      res.json(post);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /posts/:postId - Delete a post
router.delete('/:postId',
  authRateLimit,
  auth,
  async (req, res, next) => {
    try {
      const { postId } = req.params;

      const post = await Post.findByPk(postId);

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if the user owns the post
      if (post.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied. You can only delete your own posts.' });
      }

      await post.destroy();

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;