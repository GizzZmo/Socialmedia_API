const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Follow = sequelize.define('Follow', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  follower_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  following_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'follows',
  indexes: [
    {
      unique: true,
      fields: ['follower_id', 'following_id']
    }
  ],
  validate: {
    notSelfFollow() {
      if (this.follower_id === this.following_id) {
        throw new Error('A user cannot follow themselves');
      }
    }
  }
});

module.exports = Follow;