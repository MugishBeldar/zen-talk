import Message from '../models/Message.js'
import Chat from '../models/Chat.js'
import { AppError } from '../utils/errors.js'
import redisService from '../services/redisService.js'

/**
 * Get messages for a specific chat
 */
export const getChatMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params
    const { page = 1, limit = 50 } = req.query
    const userId = req.user.id
    
    // Check if user is participant in the chat
    const chat = await Chat.findById(chatId)
    if (!chat) {
      throw new AppError('Chat not found', 404)
    }
    
    if (!chat.isParticipant(userId)) {
      throw new AppError('Access denied', 403)
    }
    
    // Try to get recent messages from cache first (only for first page)
    let messages
    if (page === 1) {
      messages = await redisService.getRecentMessages(chatId)
    }

    if (!messages) {
      // Get messages from database
      messages = await Message.findChatMessages(chatId, parseInt(page), parseInt(limit))

      // Cache recent messages (only first page)
      if (page === 1) {
        await redisService.cacheRecentMessages(chatId, messages)
      }
    }
    
    // Mark messages as read
    await Message.markChatAsRead(chatId, userId)
    
    // Update user's last seen in chat
    await chat.updateLastSeen(userId)
    
    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: messages.length === parseInt(limit)
        }
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Send a new message
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params
    const { content, type = 'text', replyTo } = req.body
    const userId = req.user.id
    
    // Validate content
    if (!content || !content.text) {
      throw new AppError('Message content is required', 400)
    }
    
    // Check if user is participant in the chat
    const chat = await Chat.findById(chatId)
    if (!chat) {
      throw new AppError('Chat not found', 404)
    }
    
    if (!chat.isParticipant(userId)) {
      throw new AppError('Access denied', 403)
    }
    
    // Create message
    const message = new Message({
      chat: chatId,
      sender: userId,
      content: {
        text: content.text,
        type: type,
        attachments: content.attachments || []
      },
      replyTo: replyTo || null,
      metadata: {
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip
      }
    })
    
    await message.save()
    
    // Populate message data
    await message.populate('sender', 'firstName lastName username avatar')
    if (replyTo) {
      await message.populate('replyTo', 'content.text sender')
    }
    
    // Update chat's last activity
    chat.lastActivity = new Date()
    await chat.save()
    
    res.status(201).json({
      success: true,
      data: { message }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Edit a message
 */
export const editMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params
    const { content } = req.body
    const userId = req.user.id
    
    const message = await Message.findById(messageId)
    if (!message) {
      throw new AppError('Message not found', 404)
    }
    
    // Check if user is the sender
    if (message.sender.toString() !== userId) {
      throw new AppError('Can only edit your own messages', 403)
    }
    
    // Check if message is not too old (e.g., 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    if (message.createdAt < twentyFourHoursAgo) {
      throw new AppError('Cannot edit messages older than 24 hours', 400)
    }
    
    await message.editContent(content)
    
    res.json({
      success: true,
      data: { message }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Delete a message
 */
export const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params
    const userId = req.user.id
    
    const message = await Message.findById(messageId)
    if (!message) {
      throw new AppError('Message not found', 404)
    }
    
    // Check if user is the sender or chat admin
    const chat = await Chat.findById(message.chat)
    const userRole = chat.getParticipantRole(userId)
    
    if (message.sender.toString() !== userId && userRole !== 'admin') {
      throw new AppError('Insufficient permissions', 403)
    }
    
    await message.softDelete()
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Add reaction to a message
 */
export const addReaction = async (req, res, next) => {
  try {
    const { messageId } = req.params
    const { emoji } = req.body
    const userId = req.user.id
    
    if (!emoji) {
      throw new AppError('Emoji is required', 400)
    }
    
    const message = await Message.findById(messageId)
    if (!message) {
      throw new AppError('Message not found', 404)
    }
    
    // Check if user has access to the chat
    const chat = await Chat.findById(message.chat)
    if (!chat.isParticipant(userId)) {
      throw new AppError('Access denied', 403)
    }
    
    await message.addReaction(userId, emoji)
    
    res.json({
      success: true,
      data: { message }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Remove reaction from a message
 */
export const removeReaction = async (req, res, next) => {
  try {
    const { messageId } = req.params
    const userId = req.user.id
    
    const message = await Message.findById(messageId)
    if (!message) {
      throw new AppError('Message not found', 404)
    }
    
    // Check if user has access to the chat
    const chat = await Chat.findById(message.chat)
    if (!chat.isParticipant(userId)) {
      throw new AppError('Access denied', 403)
    }
    
    await message.removeReaction(userId)
    
    res.json({
      success: true,
      data: { message }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Search messages in a chat
 */
export const searchMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params
    const { query, page = 1, limit = 20 } = req.query
    const userId = req.user.id
    
    if (!query || query.length < 2) {
      throw new AppError('Search query must be at least 2 characters', 400)
    }
    
    // Check if user is participant in the chat
    const chat = await Chat.findById(chatId)
    if (!chat) {
      throw new AppError('Chat not found', 404)
    }
    
    if (!chat.isParticipant(userId)) {
      throw new AppError('Access denied', 403)
    }
    
    const messages = await Message.searchMessages(chatId, query, parseInt(page), parseInt(limit))
    
    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: messages.length === parseInt(limit)
        }
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Mark messages as read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { chatId } = req.params
    const userId = req.user.id
    
    // Check if user is participant in the chat
    const chat = await Chat.findById(chatId)
    if (!chat) {
      throw new AppError('Chat not found', 404)
    }
    
    if (!chat.isParticipant(userId)) {
      throw new AppError('Access denied', 403)
    }
    
    await Message.markChatAsRead(chatId, userId)
    await chat.updateLastSeen(userId)
    
    res.json({
      success: true,
      message: 'Messages marked as read'
    })
  } catch (error) {
    next(error)
  }
}
