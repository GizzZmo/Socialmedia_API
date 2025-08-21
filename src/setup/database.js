require('dotenv').config();
const sequelize = require('../config/database');
const { User, Post, Comment, Like, Follow } = require('../models');

const setupDatabase = async () => {
  try {
    console.log('Setting up database...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Force sync to create fresh tables
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created successfully.');

    // Create some sample data
    console.log('Creating sample data...');

    const users = await User.bulkCreate(
      [
        {
          username: 'john_doe',
          email: 'john.doe@example.com',
          password: 'password123',
          full_name: 'John Doe',
          bio: 'Lover of coffee and code.',
          profile_picture_url: 'https://via.placeholder.com/150/1',
        },
        {
          username: 'jane_smith',
          email: 'jane.smith@example.com',
          password: 'password123',
          full_name: 'Jane Smith',
          bio: 'Digital nomad and tech enthusiast.',
          profile_picture_url: 'https://via.placeholder.com/150/2',
        },
        {
          username: 'mike_johnson',
          email: 'mike.johnson@example.com',
          password: 'password123',
          full_name: 'Mike Johnson',
          bio: 'Photographer and traveler.',
          profile_picture_url: 'https://via.placeholder.com/150/3',
        },
      ],
      {
        individualHooks: true, // This ensures password hashing works
      }
    );

    const posts = await Post.bulkCreate([
      {
        content:
          'Just launched my new project! Excited to share it with everyone.',
        image_url: 'https://via.placeholder.com/400x300/post1',
        user_id: users[0].id,
      },
      {
        content:
          'Beautiful sunset from my office window today. Remote work has its perks!',
        image_url: 'https://via.placeholder.com/400x300/post2',
        user_id: users[1].id,
      },
      {
        content:
          'Coffee and code - the perfect combination for a productive morning.',
        user_id: users[0].id,
      },
      {
        content: 'Amazing street art I found during my walk today.',
        image_url: 'https://via.placeholder.com/400x300/post3',
        user_id: users[2].id,
      },
    ]);

    await Comment.bulkCreate([
      {
        text: 'Congratulations on the launch!',
        user_id: users[1].id,
        post_id: posts[0].id,
      },
      {
        text: "Looks amazing! Can't wait to try it.",
        user_id: users[2].id,
        post_id: posts[0].id,
      },
      {
        text: 'That view is incredible!',
        user_id: users[0].id,
        post_id: posts[1].id,
      },
      {
        text: 'The perfect morning routine!',
        user_id: users[1].id,
        post_id: posts[2].id,
      },
    ]);

    // Update posts comment counts
    for (const post of posts) {
      const commentCount = await Comment.count({ where: { post_id: post.id } });
      await post.update({ comments_count: commentCount });
    }

    // Create some follows
    await Follow.bulkCreate([
      {
        follower_id: users[0].id,
        following_id: users[1].id,
      },
      {
        follower_id: users[0].id,
        following_id: users[2].id,
      },
      {
        follower_id: users[1].id,
        following_id: users[0].id,
      },
    ]);

    // Create some likes
    await Like.bulkCreate([
      {
        user_id: users[1].id,
        post_id: posts[0].id,
      },
      {
        user_id: users[2].id,
        post_id: posts[0].id,
      },
      {
        user_id: users[0].id,
        post_id: posts[1].id,
      },
    ]);

    // Update follower/following counts
    for (const user of users) {
      const followersCount = await Follow.count({
        where: { following_id: user.id },
      });
      const followingCount = await Follow.count({
        where: { follower_id: user.id },
      });
      await user.update({
        followers_count: followersCount,
        following_count: followingCount,
      });
    }

    // Update posts likes count
    for (const post of posts) {
      const likesCount = await Like.count({ where: { post_id: post.id } });
      await post.update({ likes_count: likesCount });
    }

    console.log('✅ Sample data created successfully.');
    console.log(`
📊 Database Setup Complete!
👥 Users created: ${users.length}
📝 Posts created: ${posts.length}  
💬 Comments created: 4
🤝 Follows created: 3
❤️ Likes created: 3

Test accounts:
- john_doe (john.doe@example.com) / password123
- jane_smith (jane.smith@example.com) / password123  
- mike_johnson (mike.johnson@example.com) / password123
    `);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
