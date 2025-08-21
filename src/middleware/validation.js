const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map((detail) => detail.message),
      });
    }
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map((detail) => detail.message),
      });
    }
    next();
  };
};

// Validation schemas
const userRegistrationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  full_name: Joi.string().max(100).optional(),
  bio: Joi.string().max(500).optional(),
  profile_picture_url: Joi.string().uri().optional(),
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const postCreationSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
  image_url: Joi.string().uri().optional(),
});

const commentCreationSchema = Joi.object({
  text: Joi.string().min(1).max(1000).required(),
});

const paginationSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).optional(),
  offset: Joi.number().integer().min(0).optional(),
});

module.exports = {
  validate,
  validateQuery,
  userRegistrationSchema,
  userLoginSchema,
  postCreationSchema,
  commentCreationSchema,
  paginationSchema,
};
