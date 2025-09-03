import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Chat from '../models/Chat.js'
import Message from '../models/Message.js'
import redisService from './redisService.js'

class SocketService {
  constructor() {
    this.io = null
    this.connectedUsers = new Map() // userId -> socketId
    this.userSockets = new Map() // socketId -> userId
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3001",
        methods: ["GET", "POST"],
        credentials: true
      }
    })

    // Simple authentication for user status tracking
    this.io.use(this.authenticateSocketSimple.bind(this))
    this.io.on('connection', this.handleConnection.bind(this))

    console.log('Socket.IO service initialized')
  }

  async authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1]

      if (!token) {
        return next(new Error('Authentication token required'))
      }

      const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY, { algorithms: ['RS256'] })
      const user = await User.findById(decoded.sub).select('-password')

      if (!user) {
        return next(new Error('User not found'))
      }

      socket.userId = user._id.toString()
      socket.user = user
      next()
    } catch (error) {
      next(new Error('Invalid authentication token'))
    }
  }

  async authenticateSocketSimple(socket, next) {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        console.log('No token provided, allowing connection for development')
        socket.userId = 'anonymous'
        socket.user = { id: 'anonymous', firstName: 'Anonymous', lastName: 'User' }
        return next()
      }

      const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY, { algorithms: ['RS256'] })
      const user = await User.findById(decoded.sub).select('-password')

      if (!user) {
        console.log('User not found, allowing connection for development')
        socket.userId = 'anonymous'
        socket.user = { id: 'anonymous', firstName: 'Anonymous', lastName: 'User' }
        return next()
      }

      socket.userId = user._id.toString()
      socket.user = user
      console.log(`User ${user.firstName} ${user.lastName} authenticated for Socket.IO`)
      next()
    } catch (error) {
      console.log('Token verification failed, allowing connection for development:', error.message)
      socket.userId = 'anonymous'
      socket.user = { id: 'anonymous', firstName: 'Anonymous', lastName: 'User' }
      next()
    }
  }

  async handleConnection(socket) {
    const userId = socket.userId
    const user = socket.user

    console.log(`User ${user.firstName} ${user.lastName} (${userId}) connected with socket ${socket.id}`)

    if (userId !== 'anonymous') {
      // Store user connection
      this.connectedUsers.set(userId, socket.id)
      this.userSockets.set(socket.id, userId)

      // Update user online status
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date()
      })

      // Join user to their chat rooms
      await this.joinUserChats(socket, userId)

      // Notify contacts about online status
      this.broadcastUserStatus(userId, true)

      // Send current online status of all contacts to this newly connected user
      await this.sendContactsStatusToUser(userId)
    }

    // Socket event handlers
    socket.on('join_chat', (data) => this.handleJoinChat(socket, data))
    socket.on('leave_chat', (data) => this.handleLeaveChat(socket, data))
    socket.on('send_message', (data) => this.handleSendMessage(socket, data))
    socket.on('typing_start', (data) => this.handleTypingStart(socket, data))
    socket.on('typing_stop', (data) => this.handleTypingStop(socket, data))
    socket.on('message_read', (data) => this.handleMessageRead(socket, data))
    socket.on('disconnect', () => this.handleDisconnect(socket))
  }

  async joinUserChats(socket, userId) {
    try {
      const chats = await Chat.find({
        'participants.user': userId
      }).select('_id')

      chats.forEach(chat => {
        socket.join(`chat_${chat._id}`)
      })

      console.log(`User ${userId} joined ${chats.length} chat rooms`)
    } catch (error) {
      console.error('Error joining user chats:', error)
    }
  }

  async handleJoinChat(socket, data) {
    try {
      const { chatId } = data
      const userId = socket.userId

      console.log(`User ${userId} joining chat: ${chatId}`)

      if (userId !== 'anonymous') {
        // Verify user is participant
        const chat = await Chat.findById(chatId)
        if (!chat || !chat.isParticipant(userId)) {
          socket.emit('error', { message: 'Access denied to chat' })
          return
        }

        // Update last seen in chat
        await chat.updateLastSeen(userId)
      }

      socket.join(`chat_${chatId}`)
      socket.emit('joined_chat', { chatId })

      console.log(`Socket ${socket.id} joined chat_${chatId}`)
    } catch (error) {
      socket.emit('error', { message: 'Failed to join chat' })
    }
  }

  handleLeaveChat(socket, data) {
    const { chatId } = data
    socket.leave(`chat_${chatId}`)
    socket.emit('left_chat', { chatId })
  }

  async handleSendMessage(socket, data) {
    try {
      const { chatId, content, type = 'text', replyTo, user } = data

      // TODO: Re-enable authentication and participant verification
      console.log('Received message for chat:', chatId, 'content:', content, 'from user:', user?.firstName)

      // For now, just broadcast the message without saving to database
      // Skip authentication and participant checks for development
      // const userId = socket.userId
      // const chat = await Chat.findById(chatId)
      // if (!chat || !chat.isParticipant(userId)) {
      //   socket.emit('error', { message: 'Access denied to chat' })
      //   return
      // }

      // TODO: Re-enable message saving to database
      // For now, just broadcast the message to test real-time functionality
      const mockMessage = {
        id: Date.now().toString(),
        chat: chatId,
        content: {
          text: content.text || content,
          type: 'text',
          attachments: []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: user ? {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username
        } : {
          id: 'anonymous-user',
          firstName: 'Anonymous',
          lastName: 'User',
          username: 'anonymous'
        },
        reactions: []
      }

      // Broadcast message to all connected clients
      this.io.emit('new_message', {
        message: mockMessage,
        chatId: chatId
      })

      // Update Redis cache with the new last message
      await redisService.updateChatLastMessage(chatId, mockMessage)

      console.log('Broadcasted message:', JSON.stringify(mockMessage, null, 2))

    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' })
    }
  }

  handleTypingStart(socket, data) {
    const { chatId } = data
    const userId = socket.userId
    
    socket.to(`chat_${chatId}`).emit('user_typing', {
      userId,
      chatId,
      isTyping: true
    })
  }

  handleTypingStop(socket, data) {
    const { chatId } = data
    const userId = socket.userId
    
    socket.to(`chat_${chatId}`).emit('user_typing', {
      userId,
      chatId,
      isTyping: false
    })
  }

  async handleMessageRead(socket, data) {
    try {
      const { chatId, messageId } = data
      const userId = socket.userId

      if (messageId) {
        // Mark specific message as read
        const message = await Message.findById(messageId)
        if (message) {
          await message.markAsRead(userId)
          
          socket.to(`chat_${chatId}`).emit('message_read', {
            messageId,
            userId,
            chatId
          })
        }
      } else {
        // Mark all messages in chat as read
        await Message.markChatAsRead(chatId, userId)
        
        socket.to(`chat_${chatId}`).emit('chat_read', {
          userId,
          chatId
        })
      }
    } catch (error) {
      socket.emit('error', { message: 'Failed to mark message as read' })
    }
  }

  async handleDisconnect(socket) {
    const userId = socket.userId
    const user = socket.user

    console.log(`User ${user.firstName} ${user.lastName} (${userId}) disconnected`)

    if (userId !== 'anonymous') {
      // Remove from connected users
      this.connectedUsers.delete(userId)
      this.userSockets.delete(socket.id)

      // Update user offline status
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date()
      })

      // Notify contacts about offline status
      this.broadcastUserStatus(userId, false)
    }
  }

  async broadcastUserStatus(userId, isOnline) {
    try {
      console.log(`Broadcasting status for user ${userId}: ${isOnline ? 'online' : 'offline'}`)

      // Find all chats where this user is a participant
      const chats = await Chat.find({
        'participants.user': userId
      }).populate('participants.user', '_id')

      console.log(`Found ${chats.length} chats for user ${userId}`)

      // Get all other participants
      const contactIds = new Set()
      chats.forEach(chat => {
        chat.participants.forEach(participant => {
          if (participant.user._id.toString() !== userId) {
            contactIds.add(participant.user._id.toString())
          }
        })
      })

      console.log(`Broadcasting to ${contactIds.size} contacts:`, Array.from(contactIds))

      // Broadcast status to online contacts
      contactIds.forEach(contactId => {
        const contactSocketId = this.connectedUsers.get(contactId)
        if (contactSocketId) {
          console.log(`Sending status update to contact ${contactId} via socket ${contactSocketId}`)
          this.io.to(contactSocketId).emit('user_status_changed', {
            userId,
            isOnline,
            lastSeen: new Date()
          })
        } else {
          console.log(`Contact ${contactId} is not online`)
        }
      })
    } catch (error) {
      console.error('Error broadcasting user status:', error)
    }
  }

  async sendContactsStatusToUser(userId) {
    try {
      console.log(`Sending current contacts status to user ${userId}`)

      // Find all chats where this user is a participant
      const chats = await Chat.find({
        'participants.user': userId
      }).populate('participants.user', '_id firstName lastName isOnline lastSeen')

      // Get all other participants and their current status
      const contactStatuses = new Map()
      chats.forEach(chat => {
        chat.participants.forEach(participant => {
          if (participant.user._id.toString() !== userId) {
            const contactId = participant.user._id.toString()
            const isOnline = this.connectedUsers.has(contactId) // Check if they have an active socket connection
            contactStatuses.set(contactId, {
              userId: contactId,
              isOnline,
              lastSeen: participant.user.lastSeen
            })
          }
        })
      })

      // Send status updates to the newly connected user
      const userSocketId = this.connectedUsers.get(userId)
      if (userSocketId) {
        contactStatuses.forEach(status => {
          console.log(`Sending contact status to user ${userId}: ${status.userId} is ${status.isOnline ? 'online' : 'offline'}`)
          this.io.to(userSocketId).emit('user_status_changed', status)
        })
      }
    } catch (error) {
      console.error('Error sending contacts status to user:', error)
    }
  }

  async sendPushNotifications(chat, message, senderId) {
    try {
      // Get offline participants
      const offlineParticipants = chat.participants.filter(p => 
        p.user.toString() !== senderId && 
        !this.connectedUsers.has(p.user.toString())
      )

      // TODO: Implement push notification service
      // This would integrate with services like Firebase Cloud Messaging
      console.log(`Would send push notifications to ${offlineParticipants.length} offline users`)
    } catch (error) {
      console.error('Error sending push notifications:', error)
    }
  }

  // Utility methods
  isUserOnline(userId) {
    return this.connectedUsers.has(userId)
  }

  getUserSocket(userId) {
    const socketId = this.connectedUsers.get(userId)
    return socketId ? this.io.sockets.sockets.get(socketId) : null
  }

  getConnectedUsersCount() {
    return this.connectedUsers.size
  }

  // Emit to specific user
  emitToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId)
    if (socketId) {
      this.io.to(socketId).emit(event, data)
      return true
    }
    return false
  }

  // Emit to chat room
  emitToChat(chatId, event, data) {
    this.io.to(`chat_${chatId}`).emit(event, data)
  }
}

export default new SocketService()
