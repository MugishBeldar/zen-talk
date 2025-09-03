import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    enum: ['individual', 'group'],
    required: true,
    default: 'individual'
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  }],
  description: {
    type: String,
    maxlength: 500
  },
  avatar: {
    type: String, // URL to chat avatar image
    default: null
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  settings: {
    isArchived: {
      type: Boolean,
      default: false
    },
    isMuted: {
      type: Boolean,
      default: false
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    adminOnlyMessaging: {
      type: Boolean,
      default: false
    },
    allowMemberInvites: {
      type: Boolean,
      default: true
    },
    showReadReceipts: {
      type: Boolean,
      default: true
    },
    allowReactions: {
      type: Boolean,
      default: true
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for participant count
chatSchema.virtual('participantCount').get(function() {
  return this.participants.length
})

// Virtual for online participants
chatSchema.virtual('onlineParticipants').get(function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  return this.participants.filter(p => p.lastSeen > fiveMinutesAgo).length
})

// Index for efficient queries
chatSchema.index({ participants: 1 })
chatSchema.index({ lastActivity: -1 })
chatSchema.index({ 'participants.user': 1, lastActivity: -1 })

// Methods
chatSchema.methods.addParticipant = function(userId, role = 'member') {
  const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString())
  if (!existingParticipant) {
    this.participants.push({
      user: userId,
      role: role,
      joinedAt: new Date(),
      lastSeen: new Date()
    })
  }
  return this.save()
}

chatSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => p.user.toString() !== userId.toString())
  return this.save()
}

chatSchema.methods.updateLastSeen = function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString())
  if (participant) {
    participant.lastSeen = new Date()
    return this.save()
  }
}

chatSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.user.toString() === userId.toString())
}

chatSchema.methods.getParticipantRole = function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString())
  return participant ? participant.role : null
}

// Static methods
chatSchema.statics.findUserChats = function(userId) {
  return this.find({
    'participants.user': userId,
    'settings.isArchived': false
  })
  .populate('participants.user', 'firstName lastName username avatar isOnline lastSeen')
  .populate('lastMessage')
  .sort({ lastActivity: -1 })
}

chatSchema.statics.createIndividualChat = async function(user1Id, user2Id) {
  // Check if chat already exists
  const existingChat = await this.findOne({
    type: 'individual',
    'participants.user': { $all: [user1Id, user2Id] },
    'participants': { $size: 2 }
  })

  if (existingChat) {
    return existingChat
  }

  // Create new individual chat
  const chat = new this({
    name: 'Direct Message',
    type: 'individual',
    participants: [
      { user: user1Id, role: 'member' },
      { user: user2Id, role: 'member' }
    ],
    createdBy: user1Id
  })

  return chat.save()
}

chatSchema.statics.createGroupChat = function(name, creatorId, participantIds = []) {
  const participants = [
    { user: creatorId, role: 'admin' },
    ...participantIds.map(id => ({ user: id, role: 'member' }))
  ]

  const chat = new this({
    name,
    type: 'group',
    participants,
    createdBy: creatorId
  })

  return chat.save()
}

export default mongoose.model('Chat', chatSchema)
