import mongoose from 'mongoose';

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'light'
  },
  
  language: {
    type: String,
    default: 'en',
    maxlength: [5, 'Language code cannot exceed 5 characters']
  },
  
  timezone: {
    type: String,
    default: 'UTC',
    maxlength: [50, 'Timezone cannot exceed 50 characters']
  },
  
  notifications: {
    email: {
      messages: {
        type: Boolean,
        default: true
      },
      mentions: {
        type: Boolean,
        default: true
      },
      groupInvites: {
        type: Boolean,
        default: true
      },
      newsletter: {
        type: Boolean,
        default: false
      }
    },
    push: {
      messages: {
        type: Boolean,
        default: true
      },
      mentions: {
        type: Boolean,
        default: true
      },
      groupInvites: {
        type: Boolean,
        default: true
      }
    },
    inApp: {
      sound: {
        type: Boolean,
        default: true
      },
      desktop: {
        type: Boolean,
        default: true
      },
      vibration: {
        type: Boolean,
        default: false
      }
    }
  },
  
  privacy: {
    showOnlineStatus: {
      type: Boolean,
      default: true
    },
    showLastSeen: {
      type: Boolean,
      default: true
    },
    allowDirectMessages: {
      type: Boolean,
      default: true
    },
    profileVisibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public'
    },
    readReceipts: {
      type: Boolean,
      default: true
    }
  },
  
  chat: {
    enterToSend: {
      type: Boolean,
      default: true
    },
    showTypingIndicators: {
      type: Boolean,
      default: true
    },
    autoDownloadMedia: {
      type: Boolean,
      default: false
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    messageGrouping: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Convert _id to id
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Instance method to update specific preference category
userPreferencesSchema.methods.updateCategory = async function(category, updates) {
  if (!this[category]) {
    throw new Error(`Invalid preference category: ${category}`);
  }
  
  // Merge updates with existing preferences
  Object.assign(this[category], updates);
  this.markModified(category);
  
  return this.save();
};

// Instance method to reset to defaults
userPreferencesSchema.methods.resetToDefaults = async function() {
  const defaultPrefs = new this.constructor();
  
  this.theme = defaultPrefs.theme;
  this.language = defaultPrefs.language;
  this.timezone = defaultPrefs.timezone;
  this.notifications = defaultPrefs.notifications;
  this.privacy = defaultPrefs.privacy;
  this.chat = defaultPrefs.chat;
  
  return this.save();
};

// Instance method to get notification settings for a specific type
userPreferencesSchema.methods.getNotificationSettings = function(type) {
  if (!this.notifications[type]) {
    throw new Error(`Invalid notification type: ${type}`);
  }
  
  return this.notifications[type];
};

// Instance method to update notification settings
userPreferencesSchema.methods.updateNotificationSettings = async function(type, settings) {
  if (!this.notifications[type]) {
    throw new Error(`Invalid notification type: ${type}`);
  }
  
  Object.assign(this.notifications[type], settings);
  this.markModified('notifications');
  
  return this.save();
};

// Static method to create default preferences for user
userPreferencesSchema.statics.createDefaultForUser = function(userId, customSettings = {}) {
  const defaultPreferences = new this({
    userId,
    ...customSettings
  });
  
  return defaultPreferences.save();
};

// Static method to find or create preferences for user
userPreferencesSchema.statics.findOrCreateForUser = async function(userId, customSettings = {}) {
  let preferences = await this.findOne({ userId });
  
  if (!preferences) {
    preferences = await this.createDefaultForUser(userId, customSettings);
  }
  
  return preferences;
};

// Static method to update user preferences
userPreferencesSchema.statics.updateUserPreferences = async function(userId, updates) {
  const preferences = await this.findOrCreateForUser(userId);
  
  // Update only provided fields
  Object.keys(updates).forEach(key => {
    if (preferences[key] !== undefined) {
      if (typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
        // Deep merge for nested objects
        Object.assign(preferences[key], updates[key]);
        preferences.markModified(key);
      } else {
        preferences[key] = updates[key];
      }
    }
  });
  
  return preferences.save();
};

// Static method to get preferences with fallback to defaults
userPreferencesSchema.statics.getPreferencesWithDefaults = async function(userId) {
  const preferences = await this.findOne({ userId });
  
  if (!preferences) {
    return this.createDefaultForUser(userId);
  }
  
  return preferences;
};

// Static method to bulk update preferences for multiple users
userPreferencesSchema.statics.bulkUpdatePreferences = function(updates) {
  const bulkOps = updates.map(({ userId, preferences }) => ({
    updateOne: {
      filter: { userId },
      update: { $set: preferences },
      upsert: true
    }
  }));
  
  return this.bulkWrite(bulkOps);
};

// Virtual for checking if user has customized preferences
userPreferencesSchema.virtual('isCustomized').get(function() {
  const defaultPrefs = new this.constructor();
  
  // Compare current preferences with defaults
  const hasCustomTheme = this.theme !== defaultPrefs.theme;
  const hasCustomLanguage = this.language !== defaultPrefs.language;
  const hasCustomTimezone = this.timezone !== defaultPrefs.timezone;
  
  return hasCustomTheme || hasCustomLanguage || hasCustomTimezone;
});

// Virtual for getting all notification preferences flattened
userPreferencesSchema.virtual('allNotifications').get(function() {
  return {
    ...this.notifications.email,
    ...this.notifications.push,
    ...this.notifications.inApp
  };
});

// Pre-save middleware to validate timezone
userPreferencesSchema.pre('save', function(next) {
  // Basic timezone validation
  if (this.timezone && !this.timezone.match(/^[A-Za-z_\/]+$/)) {
    return next(new Error('Invalid timezone format'));
  }
  
  next();
});

// Ensure virtual fields are serialized
userPreferencesSchema.set('toJSON', { virtuals: true });

const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);

export default UserPreferences;
