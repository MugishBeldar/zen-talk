import Chat from '../models/Chat.js'
import Message from '../models/Message.js'
import User from '../models/User.js'
import { AppError } from '../utils/errors.js'
import redisService from '../services/redisService.js'

/**
 * Get all chats for the authenticated user
 */
export const getUserChats = async (req, res, next) => {
  try {
    const userId = req.user.id

    // Try to get from cache first
    let chats = await redisService.getUserChats(userId)

    if (!chats) {
      // If not in cache, fetch from database
      chats = await Chat.findUserChats(userId)

      // Cache the result
      await redisService.cacheUserChats(userId, chats)
    }
    
    // Get unread count for each chat
    const chatsWithUnreadCount = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.getUnreadCount(chat._id, userId)
        
        // Format chat data
        const chatData = {
          id: chat._id,
          name: chat.name,
          type: chat.type,
          avatar: chat.avatar,
          lastMessage: chat.lastMessage ? {
            content: chat.lastMessage.content.text,
            sender: chat.lastMessage.sender,
            timestamp: chat.lastMessage.createdAt
          } : null,
          lastActivity: chat.lastActivity,
          unreadCount,
          participants: chat.participants.map(p => ({
            id: p.user._id,
            firstName: p.user.firstName,
            lastName: p.user.lastName,
            username: p.user.username,
            avatar: p.user.avatar,
            isOnline: p.user.isOnline,
            lastSeen: p.user.lastSeen,
            role: p.role
          })),
          settings: chat.settings,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt
        }
        
        // For individual chats, set name to other participant's name
        if (chat.type === 'individual' && chat.participants.length === 2) {
          const otherParticipant = chat.participants.find(p => p.user._id.toString() !== userId)
          if (otherParticipant) {
            chatData.name = `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
            chatData.isOnline = otherParticipant.user.isOnline
            chatData.lastSeen = otherParticipant.user.lastSeen
            chatData.participantId = otherParticipant.user._id.toString() // Add participant ID for status updates
          }
        }
        
        return chatData
      })
    )
    
    res.json({
      success: true,
      data: {
        chats: chatsWithUnreadCount,
        total: chatsWithUnreadCount.length
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get a specific chat by ID
 */
export const getChatById = async (req, res, next) => {
  try {
    const { chatId } = req.params
    const userId = req.user.id
    
    const chat = await Chat.findById(chatId)
      .populate('participants.user', 'firstName lastName username avatar isOnline lastSeen')
      .populate('lastMessage')
    
    if (!chat) {
      throw new AppError('Chat not found', 404)
    }
    
    // Check if user is a participant
    if (!chat.isParticipant(userId)) {
      throw new AppError('Access denied', 403)
    }
    
    // Update user's last seen in this chat
    await chat.updateLastSeen(userId)
    
    res.json({
      success: true,
      data: { chat }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Create a new group chat
 */
export const createGroupChat = async (req, res, next) => {
  try {
    const { name, description, participantIds = [] } = req.body
    const creatorId = req.user.id
    
    // Validate participants exist
    const participants = await User.find({ _id: { $in: participantIds } })
    if (participants.length !== participantIds.length) {
      throw new AppError('Some participants not found', 400)
    }
    
    const chat = await Chat.createGroupChat(name, creatorId, participantIds)
    
    // Populate the created chat
    await chat.populate('participants.user', 'firstName lastName username avatar isOnline lastSeen')
    
    res.status(201).json({
      success: true,
      data: { chat }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Create or get individual chat
 */
export const createIndividualChat = async (req, res, next) => {
  try {
    const { participantId } = req.body
    const userId = req.user.id
    
    if (participantId === userId) {
      throw new AppError('Cannot create chat with yourself', 400)
    }
    
    // Check if participant exists
    const participant = await User.findById(participantId)
    if (!participant) {
      throw new AppError('Participant not found', 404)
    }
    
    const chat = await Chat.createIndividualChat(userId, participantId)

    // Populate the chat
    await chat.populate('participants.user', 'firstName lastName username avatar isOnline lastSeen')

    // Format chat data to match getUserChats format
    const formattedChat = {
      id: chat._id,
      name: chat.name,
      type: chat.type,
      avatar: chat.avatar,
      lastMessage: chat.lastMessage && chat.lastMessage.content ? {
        content: chat.lastMessage.content.text,
        sender: chat.lastMessage.sender,
        timestamp: chat.lastMessage.createdAt
      } : null,
      lastActivity: chat.lastActivity,
      unreadCount: 0, // New chat has no unread messages
      participants: chat.participants.map(p => ({
        id: p.user._id,
        firstName: p.user.firstName,
        lastName: p.user.lastName,
        username: p.user.username,
        avatar: p.user.avatar,
        isOnline: p.user.isOnline,
        lastSeen: p.user.lastSeen,
        role: p.role,
        joinedAt: p.joinedAt,
        permissions: p.permissions
      })),
      settings: chat.settings,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    }

    // Invalidate Redis cache for both users
    await redisService.invalidateUserChatsCache(userId)
    await redisService.invalidateUserChatsCache(participantId)

    res.status(201).json({
      success: true,
      data: { chat: formattedChat }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Add participants to a group chat
 */
export const addParticipants = async (req, res, next) => {
  try {
    const { chatId } = req.params
    const { participantIds } = req.body
    const userId = req.user.id
    
    const chat = await Chat.findById(chatId)
    if (!chat) {
      throw new AppError('Chat not found', 404)
    }
    
    if (chat.type !== 'group') {
      throw new AppError('Can only add participants to group chats', 400)
    }
    
    // Check if user is admin
    const userRole = chat.getParticipantRole(userId)
    if (userRole !== 'admin') {
      throw new AppError('Only admins can add participants', 403)
    }
    
    // Add participants
    for (const participantId of participantIds) {
      await chat.addParticipant(participantId)
    }
    
    await chat.populate('participants.user', 'firstName lastName username avatar isOnline lastSeen')
    
    res.json({
      success: true,
      data: { chat }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Remove participant from group chat
 */
export const removeParticipant = async (req, res, next) => {
  try {
    const { chatId, participantId } = req.params
    const userId = req.user.id
    
    const chat = await Chat.findById(chatId)
    if (!chat) {
      throw new AppError('Chat not found', 404)
    }
    
    if (chat.type !== 'group') {
      throw new AppError('Can only remove participants from group chats', 400)
    }
    
    // Check permissions
    const userRole = chat.getParticipantRole(userId)
    if (userRole !== 'admin' && userId !== participantId) {
      throw new AppError('Insufficient permissions', 403)
    }
    
    await chat.removeParticipant(participantId)
    
    res.json({
      success: true,
      message: 'Participant removed successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update chat settings
 */
export const updateChatSettings = async (req, res, next) => {
  try {
    const { chatId } = req.params
    const { name, description, avatar } = req.body
    const userId = req.user.id
    
    const chat = await Chat.findById(chatId)
    if (!chat) {
      throw new AppError('Chat not found', 404)
    }
    
    // Check if user is participant
    if (!chat.isParticipant(userId)) {
      throw new AppError('Access denied', 403)
    }
    
    // For group chats, only admins can update settings
    if (chat.type === 'group') {
      const userRole = chat.getParticipantRole(userId)
      if (userRole !== 'admin') {
        throw new AppError('Only admins can update chat settings', 403)
      }
    }
    
    // Update fields
    if (name) chat.name = name
    if (description) chat.description = description
    if (avatar) chat.avatar = avatar
    
    await chat.save()
    
    res.json({
      success: true,
      data: { chat }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Delete/Leave chat
 */
export const deleteChat = async (req, res, next) => {
  try {
    const { chatId } = req.params
    const userId = req.user.id

    const chat = await Chat.findById(chatId)
    if (!chat) {
      throw new AppError('Chat not found', 404)
    }

    if (chat.type === 'individual') {
      // For individual chats, just remove the user from participants
      await chat.removeParticipant(userId)
    } else {
      // For group chats
      const userRole = chat.getParticipantRole(userId)

      if (userRole === 'admin') {
        // If admin is leaving, transfer admin to another participant or delete chat
        const otherParticipants = chat.participants.filter(p => p.user.toString() !== userId)

        if (otherParticipants.length === 0) {
          // Delete the entire chat if no other participants
          await Chat.findByIdAndDelete(chatId)
          await Message.deleteMany({ chat: chatId })
        } else {
          // Transfer admin to first participant and remove current user
          otherParticipants[0].role = 'admin'
          await chat.removeParticipant(userId)
        }
      } else {
        // Regular member leaving
        await chat.removeParticipant(userId)
      }
    }

    res.json({
      success: true,
      message: 'Left chat successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Search users to start new chats
 */
export const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query
    const userId = req.user.id

    if (!query || query.length < 2) {
      throw new AppError('Search query must be at least 2 characters', 400)
    }

    const users = await User.find({
      _id: { $ne: userId }, // Exclude current user
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ]
    })
    .select('firstName lastName username avatar isOnline lastSeen')
    .limit(20)

    res.json({
      success: true,
      data: { users }
    })
  } catch (error) {
    next(error)
  }
}
