const express = require('express');
const { Post, User, Follow } = require('../models');
const { auth } = require('../middleware/auth');
const { authRateLimit } = require('../middleware/rateLimiting');
const {
  validateQuery,
  paginationSchema,
} = require('../middleware/validation');

const router = express.Router();

// GET /feed - Get personalized feed for authenticated user
router.get(
  '/feed',
  authRateLimit,
  auth,
  validateQuery(paginationSchema),
  async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      // Get list of users that the current user follows
      const following = await Follow.findAll({
        where: { follower_id: req.user.id },
        attributes: ['following_id'],
      });

      const followingIds = following.map((follow) => follow.following_id);

      // Include the user's own posts in the feed
      followingIds.push(req.user.id);

      // Get posts from followed users and own posts
      const posts = await Post.findAll({
        where: {
          user_id: followingIds,
        },
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

module.exports = router;