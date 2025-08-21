const express = require('express');
const { User, Follow } = require('../models');
const { auth, optionalAuth } = require('../middleware/auth');
const {
  authRateLimit,
  unauthRateLimit,
} = require('../middleware/rateLimiting');
const {
  validateQuery,
  paginationSchema,
} = require('../middleware/validation');

const router = express.Router();

// POST /users/:userId/follow - Follow a user
router.post(
  '/:userId/follow',
  authRateLimit,
  auth,
  async (req, res, next) => {
    try {
      const { userId } = req.params;

      // Check if user exists
      const userToFollow = await User.findByPk(userId);
      if (!userToFollow) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Prevent self-follow
      if (userId === req.user.id) {
        return res.status(400).json({ error: 'Cannot follow yourself' });
      }

      // Check if already following
      const existingFollow = await Follow.findOne({
        where: {
          follower_id: req.user.id,
          following_id: userId,
        },
      });

      if (existingFollow) {
        return res.status(409).json({ error: 'Already following this user' });
      }

      // Create follow relationship
      await Follow.create({
        follower_id: req.user.id,
        following_id: userId,
      });

      // Update follower/following counts
      await req.user.increment('following_count');
      await userToFollow.increment('followers_count');

      res.status(201).json({ message: 'User followed successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /users/:userId/follow - Unfollow a user
router.delete(
  '/:userId/follow',
  authRateLimit,
  auth,
  async (req, res, next) => {
    try {
      const { userId } = req.params;

      // Check if user exists
      const userToUnfollow = await User.findByPk(userId);
      if (!userToUnfollow) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Find and remove follow relationship
      const follow = await Follow.findOne({
        where: {
          follower_id: req.user.id,
          following_id: userId,
        },
      });

      if (!follow) {
        return res.status(404).json({ error: 'Not following this user' });
      }

      await follow.destroy();

      // Update follower/following counts
      await req.user.decrement('following_count');
      await userToUnfollow.decrement('followers_count');

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// GET /users/:userId/followers - Get user's followers
router.get(
  '/:userId/followers',
  unauthRateLimit,
  optionalAuth,
  validateQuery(paginationSchema),
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const followers = await Follow.findAll({
        where: { following_id: userId },
        include: [
          {
            model: User,
            as: 'follower',
            attributes: ['id', 'username', 'full_name', 'profile_picture_url'],
          },
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset,
      });

      const hasMore = followers.length === limit;

      res.json({
        followers: followers.map((follow) => follow.follower),
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

// GET /users/:userId/following - Get users that this user follows
router.get(
  '/:userId/following',
  unauthRateLimit,
  optionalAuth,
  validateQuery(paginationSchema),
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const following = await Follow.findAll({
        where: { follower_id: userId },
        include: [
          {
            model: User,
            as: 'following',
            attributes: ['id', 'username', 'full_name', 'profile_picture_url'],
          },
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset,
      });

      const hasMore = following.length === limit;

      res.json({
        following: following.map((follow) => follow.following),
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