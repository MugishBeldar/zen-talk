import mongoose from 'mongoose';
import { databaseConfig, env } from './index.js';

// Database connection
export const connectDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    const connection = await mongoose.connect(databaseConfig.uri, databaseConfig.options);
    
    console.log(`✅ MongoDB connected: ${connection.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error);
        process.exit(1);
      }
    });
    
    return connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Create database indexes
export const createIndexes = async () => {
  try {
    console.log('🔄 Creating database indexes...');
    
    // Users collection indexes
    await mongoose.connection.db.collection('users').createIndex(
      { email: 1 }, 
      { unique: true, background: true }
    );
    
    await mongoose.connection.db.collection('users').createIndex(
      { username: 1 }, 
      { unique: true, background: true }
    );
    
    await mongoose.connection.db.collection('users').createIndex(
      { isActive: 1, createdAt: -1 }, 
      { background: true }
    );
    
    await mongoose.connection.db.collection('users').createIndex(
      { status: 1, lastSeen: -1 }, 
      { background: true }
    );
    
    // RefreshTokens collection indexes
    await mongoose.connection.db.collection('refreshtokens').createIndex(
      { userId: 1, isActive: 1 }, 
      { background: true }
    );
    
    await mongoose.connection.db.collection('refreshtokens').createIndex(
      { token: 1 }, 
      { background: true }
    );
    
    await mongoose.connection.db.collection('refreshtokens').createIndex(
      { expiresAt: 1 }, 
      { expireAfterSeconds: 0, background: true }
    );
    
    // UserSessions collection indexes
    await mongoose.connection.db.collection('usersessions').createIndex(
      { userId: 1, isActive: 1 }, 
      { background: true }
    );
    
    await mongoose.connection.db.collection('usersessions').createIndex(
      { sessionId: 1 }, 
      { background: true }
    );
    
    await mongoose.connection.db.collection('usersessions').createIndex(
      { lastActivityAt: 1 }, 
      { background: true }
    );
    
    // UserPreferences collection indexes
    await mongoose.connection.db.collection('userpreferences').createIndex(
      { userId: 1 }, 
      { unique: true, background: true }
    );
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating database indexes:', error);
    // Don't exit process for index creation errors in development
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Database health check
export const checkDatabaseHealth = async () => {
  try {
    await mongoose.connection.db.admin().ping();
    return { status: 'healthy', message: 'Database connection is active' };
  } catch (error) {
    return { status: 'unhealthy', message: error.message };
  }
};

export default { connectDatabase, createIndexes, checkDatabaseHealth };
