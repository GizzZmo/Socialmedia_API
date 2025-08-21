const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { auth, optionalAuth } = require('../middleware/auth');
const {
  authEndpointRateLimit,
  unauthRateLimit,
} = require('../middleware/rateLimiting');
const {
  validate,
  userRegistrationSchema,
  userLoginSchema,
} = require('../middleware/validation');

const router = express.Router();

// POST /users - Create a new user (Registration)
router.post(
  '/',
  authEndpointRateLimit,
  validate(userRegistrationSchema),
  async (req, res, next) => {
    try {
      const { username, email, password, full_name, bio, profile_picture_url } =
        req.body;

      const user = await User.create({
        username,
        email,
        password,
        full_name,
        bio,
        profile_picture_url,
      });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      res.status(201).json({
        user,
        token,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /users/login - User login
router.post(
  '/login',
  authEndpointRateLimit,
  validate(userLoginSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      res.json({
        user,
        token,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /users/:userId - Get user profile
router.get(
  '/:userId',
  unauthRateLimit,
  optionalAuth,
  async (req, res, next) => {
    try {
      const { userId } = req.params;

      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// GET /users/me - Get current user profile
router.get('/me', auth, async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
