const express = require('express');
const { Comment, User, Post } = require('../models');
const { auth, optionalAuth } = require('../middleware/auth');
const { authRateLimit, unauthRateLimit } = require('../middleware/rateLimiting');
const { validate, validateQuery, commentCreationSchema, paginationSchema } = require('../middleware/validation');

const router = express.Router();

// GET /posts/:postId/comments - Get comments for a post
router.get('/:postId/comments',
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

      const comments = await Comment.findAll({
        where: { post_id: postId },
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profile_picture_url']
        }],
        order: [['created_at', 'ASC']],
        limit,
        offset
      });

      const hasMore = comments.length === limit;

      res.json({
        comments,
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

// POST /posts/:postId/comments - Add a comment to a post
router.post('/:postId/comments',
  authRateLimit,
  auth,
  validate(commentCreationSchema),
  async (req, res, next) => {
    try {
      const { postId } = req.params;
      const { text } = req.body;

      // Check if post exists
      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const comment = await Comment.create({
        text,
        user_id: req.user.id,
        post_id: postId
      });

      // Update post comments count
      await post.increment('comments_count');

      // Fetch the created comment with author information
      const createdComment = await Comment.findByPk(comment.id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'profile_picture_url']
        }]
      });

      res.status(201).json(createdComment);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /posts/:postId/comments/:commentId - Delete a comment
router.delete('/:postId/comments/:commentId',
  authRateLimit,
  auth,
  async (req, res, next) => {
    try {
      const { postId, commentId } = req.params;

      const comment = await Comment.findOne({
        where: { 
          id: commentId,
          post_id: postId
        }
      });

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Check if the user owns the comment
      if (comment.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied. You can only delete your own comments.' });
      }

      await comment.destroy();

      // Update post comments count
      const post = await Post.findByPk(postId);
      if (post) {
        await post.decrement('comments_count');
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;