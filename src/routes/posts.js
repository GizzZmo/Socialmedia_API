const express = require('express');
const { Post, User, Like } = require('../models');
const { auth, optionalAuth } = require('../middleware/auth');
const {
  authRateLimit,
  unauthRateLimit,
} = require('../middleware/rateLimiting');
const {
  validate,
  validateQuery,
  postCreationSchema,
  paginationSchema,
} = require('../middleware/validation');

const router = express.Router();

// GET /posts - Get list of posts
router.get(
  '/',
  unauthRateLimit,
  optionalAuth,
  validateQuery(paginationSchema),
  async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      const posts = await Post.findAll({
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'profile_picture_url'],
          },
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset,
      });

      const hasMore = posts.length === limit;

      res.json({
        posts,
        pagination: {
          ...(hasMore && { next_offset: offset + limit }),
          limit,
          offset,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /posts - Create a new post
router.post(
  '/',
  authRateLimit,
  auth,
  validate(postCreationSchema),
  async (req, res, next) => {
    try {
      const { content, image_url } = req.body;

      const post = await Post.create({
        content,
        image_url,
        user_id: req.user.id,
      });

      // Fetch the created post with author information
      const createdPost = await Post.findByPk(post.id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'profile_picture_url'],
          },
        ],
      });

      res.status(201).json(createdPost);
    } catch (error) {
      next(error);
    }
  }
);

// GET /posts/:postId - Get a specific post
router.get(
  '/:postId',
  unauthRateLimit,
  optionalAuth,
  async (req, res, next) => {
    try {
      const { postId } = req.params;

      const post = await Post.findByPk(postId, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'profile_picture_url'],
          },
        ],
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
router.delete('/:postId', authRateLimit, auth, async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the user owns the post
    if (post.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: 'Access denied. You can only delete your own posts.' });
    }

    await post.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// POST /posts/:postId/like - Like a post
router.post(
  '/:postId/like',
  authRateLimit,
  auth,
  async (req, res, next) => {
    try {
      const { postId } = req.params;

      // Check if post exists
      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if already liked
      const existingLike = await Like.findOne({
        where: {
          user_id: req.user.id,
          post_id: postId,
        },
      });

      if (existingLike) {
        return res.status(409).json({ error: 'Post already liked' });
      }

      // Create like
      await Like.create({
        user_id: req.user.id,
        post_id: postId,
      });

      // Update post likes count
      await post.increment('likes_count');

      res.status(201).json({ message: 'Post liked successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /posts/:postId/like - Unlike a post
router.delete(
  '/:postId/like',
  authRateLimit,
  auth,
  async (req, res, next) => {
    try {
      const { postId } = req.params;

      // Check if post exists
      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Find and remove like
      const like = await Like.findOne({
        where: {
          user_id: req.user.id,
          post_id: postId,
        },
      });

      if (!like) {
        return res.status(404).json({ error: 'Like not found' });
      }

      await like.destroy();

      // Update post likes count
      await post.decrement('likes_count');

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// GET /posts/:postId/likes - Get post likes
router.get(
  '/:postId/likes',
  unauthRateLimit,
  optionalAuth,
  validateQuery(paginationSchema),
  async (req, res, next) => {
    try {
      const { postId } = req.params;
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      // Check if post exists
      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const likes = await Like.findAll({
        where: { post_id: postId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'profile_picture_url'],
          },
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset,
      });

      const hasMore = likes.length === limit;

      res.json({
        likes,
        pagination: {
          ...(hasMore && { next_offset: offset + limit }),
          limit,
          offset,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
