import mongoose from 'mongoose';
import crypto from 'crypto';

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  token: {
    type: String,
    required: true,
    unique: true,
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
    }
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // TTL index for automatic cleanup
  },
  
  lastUsedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Remove sensitive token from JSON output
      delete ret.token;
      // Convert _id to id
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound index for user and active status
refreshTokenSchema.index({ userId: 1, isActive: 1 });

// Pre-save middleware to hash token
refreshTokenSchema.pre('save', function(next) {
  // Only hash the token if it has been modified (or is new)
  if (!this.isModified('token')) return next();
  
  // Hash the token for security
  this.token = crypto.createHash('sha256').update(this.token).digest('hex');
  next();
});

// Instance method to deactivate token
refreshTokenSchema.methods.deactivate = async function() {
  this.isActive = false;
  return this.save();
};

// Instance method to update last used
refreshTokenSchema.methods.updateLastUsed = async function() {
  this.lastUsedAt = new Date();
  return this.save();
};

// Static method to find active token
refreshTokenSchema.statics.findActiveToken = function(hashedToken) {
  return this.findOne({
    token: hashedToken,
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).populate('userId', 'username email firstName lastName status');
};

// Static method to deactivate all user tokens
refreshTokenSchema.statics.deactivateAllUserTokens = function(userId) {
  return this.updateMany(
    { userId, isActive: true },
    { isActive: false }
  );
};

// Static method to deactivate user tokens except current
refreshTokenSchema.statics.deactivateOtherUserTokens = function(userId, currentTokenId) {
  return this.updateMany(
    { 
      userId, 
      isActive: true,
      _id: { $ne: currentTokenId }
    },
    { isActive: false }
  );
};

// Static method to get user's active devices
refreshTokenSchema.statics.getUserActiveDevices = function(userId) {
  return this.find({
    userId,
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).select('-token').sort({ lastUsedAt: -1 });
};

// Static method to cleanup expired tokens
refreshTokenSchema.statics.cleanupExpiredTokens = function() {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isActive: false }
    ]
  });
};

// Static method to count user's active devices
refreshTokenSchema.statics.countUserActiveDevices = function(userId) {
  return this.countDocuments({
    userId,
    isActive: true,
    expiresAt: { $gt: new Date() }
  });
};

// Static method to remove oldest device if limit exceeded
refreshTokenSchema.statics.removeOldestDeviceIfNeeded = async function(userId, maxDevices = 5) {
  const deviceCount = await this.countUserActiveDevices(userId);
  
  if (deviceCount >= maxDevices) {
    // Find and deactivate the oldest device
    const oldestDevice = await this.findOne({
      userId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).sort({ lastUsedAt: 1 });
    
    if (oldestDevice) {
      await oldestDevice.deactivate();
    }
  }
};

// Static method to create hashed token
refreshTokenSchema.statics.hashToken = function(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Virtual for device fingerprint
refreshTokenSchema.virtual('deviceFingerprint').get(function() {
  const deviceString = `${this.deviceInfo.userAgent}-${this.deviceInfo.platform}-${this.deviceInfo.browser}`;
  return crypto.createHash('md5').update(deviceString).digest('hex');
});

// Ensure virtual fields are serialized
refreshTokenSchema.set('toJSON', { virtuals: true });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;
