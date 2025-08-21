const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Like = require('./Like');
const Follow = require('./Follow');

// User associations
User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
User.hasMany(Like, { foreignKey: 'user_id', as: 'likes' });

// Follow associations (self-referencing)
User.belongsToMany(User, {
  through: Follow,
  as: 'followers',
  foreignKey: 'following_id',
  otherKey: 'follower_id',
});
User.belongsToMany(User, {
  through: Follow,
  as: 'following',
  foreignKey: 'follower_id',
  otherKey: 'following_id',
});

// Post associations
Post.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });
Post.hasMany(Like, { foreignKey: 'post_id', as: 'likes' });

// Comment associations
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// Like associations
Like.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Like.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// Follow associations
Follow.belongsTo(User, { foreignKey: 'follower_id', as: 'follower' });
Follow.belongsTo(User, { foreignKey: 'following_id', as: 'following' });

module.exports = {
  User,
  Post,
  Comment,
  Like,
  Follow,
};
