import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { securityConfig } from '../config/index.js';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: [254, 'Email cannot exceed 254 characters'],
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    maxlength: [128, 'Password cannot exceed 128 characters']
  },
  
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [1, 'First name is required'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [1, 'Last name is required'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  
  avatar: {
    type: String,
    default: null,
    maxlength: [500, 'Avatar URL cannot exceed 500 characters']
  },
  
  bio: {
    type: String,
    default: '',
    maxlength: [160, 'Bio cannot exceed 160 characters'],
    trim: true
  },
  
  status: {
    type: String,
    enum: ['online', 'offline', 'away', 'busy'],
    default: 'offline'
  },
  
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(_, ret) {
      // Remove password from JSON output
      delete ret.password;
      // Convert _id to id
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(securityConfig.bcrypt.saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to update last seen
userSchema.methods.updateLastSeen = async function() {
  this.lastSeen = new Date();
  return this.save();
};

// Instance method to set status
userSchema.methods.setStatus = async function(status) {
  this.status = status;
  if (status === 'online') {
    this.lastSeen = new Date();
  }
  return this.save();
};

// Static method to find by email or username
userSchema.statics.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ],
    isActive: true
  });
};

// Static method to check if email exists
userSchema.statics.emailExists = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to check if username exists
userSchema.statics.usernameExists = function(username) {
  return this.findOne({ username: username });
};

// Static method to get user stats
userSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { _id: mongoose.Types.ObjectId.createFromHexString(userId) } },
    {
      $lookup: {
        from: 'usersessions',
        localField: '_id',
        foreignField: 'userId',
        as: 'sessions'
      }
    },
    {
      $project: {
        username: 1,
        email: 1,
        firstName: 1,
        lastName: 1,
        createdAt: 1,
        totalSessions: { $size: '$sessions' },
        lastLogin: {
          $max: '$sessions.loginAt'
        }
      }
    }
  ]);
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);

export default User;
