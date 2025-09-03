import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    text: {
      type: String,
      maxlength: 4000
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'audio', 'video', 'emoji'],
      default: 'text'
    },
    attachments: [{
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
      url: String,
      thumbnailUrl: String
    }]
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  isThreadStarter: {
    type: Boolean,
    default: false
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  metadata: {
    deviceInfo: String,
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for read status
messageSchema.virtual('isRead').get(function() {
  return this.readBy.length > 0
})

// Virtual for reaction count
messageSchema.virtual('reactionCount').get(function() {
  return this.reactions.length
})

// Indexes for efficient queries
messageSchema.index({ chat: 1, createdAt: -1 })
messageSchema.index({ sender: 1, createdAt: -1 })
messageSchema.index({ chat: 1, isDeleted: 1, createdAt: -1 })

// Methods
messageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(r => r.user.toString() === userId.toString())
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    })
    return this.save()
  }
  return Promise.resolve(this)
}

messageSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString())
  
  // Add new reaction
  this.reactions.push({
    user: userId,
    emoji: emoji
  })
  
  return this.save()
}

messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString())
  return this.save()
}

messageSchema.methods.editContent = function(newContent) {
  // Save current content to history
  if (this.content.text) {
    this.editHistory.push({
      content: this.content.text,
      editedAt: new Date()
    })
  }
  
  // Update content
  this.content.text = newContent
  this.isEdited = true
  
  return this.save()
}

messageSchema.methods.softDelete = function() {
  this.isDeleted = true
  this.deletedAt = new Date()
  this.content.text = 'This message was deleted'
  return this.save()
}

// Static methods
messageSchema.statics.findChatMessages = function(chatId, page = 1, limit = 50) {
  const skip = (page - 1) * limit
  
  return this.find({
    chat: chatId,
    isDeleted: false
  })
  .populate('sender', 'firstName lastName username avatar')
  .populate('replyTo', 'content.text sender')
  .populate('reactions.user', 'firstName lastName username')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
}

messageSchema.statics.getUnreadCount = function(chatId, userId) {
  return this.countDocuments({
    chat: chatId,
    sender: { $ne: userId },
    'readBy.user': { $ne: userId },
    isDeleted: false
  })
}

messageSchema.statics.markChatAsRead = function(chatId, userId) {
  return this.updateMany(
    {
      chat: chatId,
      sender: { $ne: userId },
      'readBy.user': { $ne: userId },
      isDeleted: false
    },
    {
      $push: {
        readBy: {
          user: userId,
          readAt: new Date()
        }
      }
    }
  )
}

messageSchema.statics.searchMessages = function(chatId, query, page = 1, limit = 20) {
  const skip = (page - 1) * limit
  
  return this.find({
    chat: chatId,
    'content.text': { $regex: query, $options: 'i' },
    isDeleted: false
  })
  .populate('sender', 'firstName lastName username avatar')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
}

// Pre-save middleware
messageSchema.pre('save', function(next) {
  // Update chat's last activity when a new message is created
  if (this.isNew) {
    mongoose.model('Chat').findByIdAndUpdate(
      this.chat,
      { 
        lastMessage: this._id,
        lastActivity: new Date()
      }
    ).exec()
  }
  next()
})

export default mongoose.model('Message', messageSchema)
