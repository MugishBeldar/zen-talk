import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  sessionId: {
    type: String,
    required: true,
    unique: true,
    default: () => `sess_${uuidv4()}`,
    index: true
  },
  
  deviceInfo: {
    userAgent: {
      type: String,
      required: true
    },
    ip: {
      type: String,
      required: true
    },
    platform: {
      type: String,
      required: true
    },
    browser: {
      type: String,
      required: true
    },
    location: {
      country: String,
      city: String,
      timezone: String
    }
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  loginAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  lastActivityAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  logoutAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(_, ret) {
      // Convert _id to id
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes
userSessionSchema.index({ userId: 1, isActive: 1 });
userSessionSchema.index({ userId: 1, loginAt: -1 });

// Instance method to update activity
userSessionSchema.methods.updateActivity = async function() {
  this.lastActivityAt = new Date();
  return this.save();
};

// Instance method to end session
userSessionSchema.methods.endSession = async function() {
  this.isActive = false;
  this.logoutAt = new Date();
  return this.save();
};

// Instance method to check if session is expired
userSessionSchema.methods.isExpired = function(maxInactiveTime = 30 * 24 * 60 * 60 * 1000) { // 30 days
  const now = new Date();
  const timeSinceLastActivity = now - this.lastActivityAt;
  return timeSinceLastActivity > maxInactiveTime;
};

// Static method to find active session
userSessionSchema.statics.findActiveSession = function(sessionId) {
  return this.findOne({
    sessionId,
    isActive: true
  }).populate('userId', 'username email firstName lastName status');
};

// Static method to get user's active sessions
userSessionSchema.statics.getUserActiveSessions = function(userId) {
  return this.find({
    userId,
    isActive: true
  }).sort({ lastActivityAt: -1 });
};

// Static method to end all user sessions
userSessionSchema.statics.endAllUserSessions = function(userId) {
  return this.updateMany(
    { userId, isActive: true },
    { 
      isActive: false,
      logoutAt: new Date()
    }
  );
};

// Static method to end user sessions except current
userSessionSchema.statics.endOtherUserSessions = function(userId, currentSessionId) {
  return this.updateMany(
    { 
      userId, 
      isActive: true,
      sessionId: { $ne: currentSessionId }
    },
    { 
      isActive: false,
      logoutAt: new Date()
    }
  );
};

// Static method to cleanup inactive sessions
userSessionSchema.statics.cleanupInactiveSessions = function(maxInactiveTime = 30 * 24 * 60 * 60 * 1000) {
  const cutoffDate = new Date(Date.now() - maxInactiveTime);
  
  return this.updateMany(
    {
      isActive: true,
      lastActivityAt: { $lt: cutoffDate }
    },
    {
      isActive: false,
      logoutAt: new Date()
    }
  );
};

// Static method to get session statistics
userSessionSchema.statics.getSessionStats = function(userId, timeframe = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);
  
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId.createFromHexString(userId),
        loginAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        activeSessions: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        uniqueDevices: {
          $addToSet: '$deviceInfo.platform'
        },
        lastLogin: { $max: '$loginAt' },
        totalDuration: {
          $sum: {
            $cond: [
              { $ne: ['$logoutAt', null] },
              { $subtract: ['$logoutAt', '$loginAt'] },
              { $subtract: [new Date(), '$loginAt'] }
            ]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalSessions: 1,
        activeSessions: 1,
        uniqueDeviceCount: { $size: '$uniqueDevices' },
        uniqueDevices: 1,
        lastLogin: 1,
        averageSessionDuration: {
          $divide: ['$totalDuration', '$totalSessions']
        }
      }
    }
  ]);
};

// Static method to detect suspicious activity
userSessionSchema.statics.detectSuspiciousActivity = function(userId, newDeviceInfo) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId.createFromHexString(userId),
        loginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }
    },
    {
      $group: {
        _id: null,
        uniqueIPs: { $addToSet: '$deviceInfo.ip' },
        uniquePlatforms: { $addToSet: '$deviceInfo.platform' },
        uniqueLocations: { $addToSet: '$deviceInfo.location.country' },
        recentLogins: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        suspiciousActivity: {
          $or: [
            { $gt: [{ $size: '$uniqueIPs' }, 3] }, // More than 3 different IPs
            { $gt: [{ $size: '$uniqueLocations' }, 2] }, // More than 2 countries
            { $gt: ['$recentLogins', 10] } // More than 10 logins in 24h
          ]
        },
        uniqueIPCount: { $size: '$uniqueIPs' },
        uniqueLocationCount: { $size: '$uniqueLocations' },
        recentLoginCount: '$recentLogins'
      }
    }
  ]);
};

// Virtual for session duration
userSessionSchema.virtual('duration').get(function() {
  const endTime = this.logoutAt || new Date();
  return endTime - this.loginAt;
});

// Virtual for formatted duration
userSessionSchema.virtual('formattedDuration').get(function() {
  const duration = this.duration;
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
});

// Ensure virtual fields are serialized
userSessionSchema.set('toJSON', { virtuals: true });

const UserSession = mongoose.model('UserSession', userSessionSchema);

export default UserSession;
