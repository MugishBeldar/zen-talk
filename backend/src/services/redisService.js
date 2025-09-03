import { createClient } from 'redis'

class RedisService {
  constructor() {
    this.client = null
    this.isConnected = false
  }

  async connect() {
    try {
      this.client = createClient({
        socket: {
          host: '127.0.0.1',
          port: 6379
        },
        database: 0, // Using database 0 for zentalk_caching
        name: 'zentalk_caching'
      })

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err)
        this.isConnected = false
      })

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully')
        this.isConnected = true
      })

      this.client.on('disconnect', () => {
        console.log('❌ Redis disconnected')
        this.isConnected = false
      })

      await this.client.connect()
      return true
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error.message)
      this.isConnected = false
      return false
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect()
      this.isConnected = false
    }
  }

  // Message caching with 10-minute TTL
  async cacheRecentMessages(chatId, messages) {
    if (!this.isConnected) return false
    
    try {
      const key = `chat:${chatId}:recent_messages`
      const value = JSON.stringify(messages)
      await this.client.setEx(key, 600, value) // 10 minutes TTL
      return true
    } catch (error) {
      console.error('Error caching recent messages:', error)
      return false
    }
  }

  async getRecentMessages(chatId) {
    if (!this.isConnected) return null
    
    try {
      const key = `chat:${chatId}:recent_messages`
      const cached = await this.client.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Error getting cached messages:', error)
      return null
    }
  }

  async invalidateMessageCache(chatId) {
    if (!this.isConnected) return false
    
    try {
      const key = `chat:${chatId}:recent_messages`
      await this.client.del(key)
      return true
    } catch (error) {
      console.error('Error invalidating message cache:', error)
      return false
    }
  }

  // User online status caching with 5-minute TTL
  async setUserOnlineStatus(userId, isOnline, lastSeen = new Date()) {
    if (!this.isConnected) return false
    
    try {
      const key = `user:${userId}:status`
      const value = JSON.stringify({
        isOnline,
        lastSeen: lastSeen.toISOString(),
        updatedAt: new Date().toISOString()
      })
      await this.client.setEx(key, 300, value) // 5 minutes TTL
      return true
    } catch (error) {
      console.error('Error setting user online status:', error)
      return false
    }
  }

  async getUserOnlineStatus(userId) {
    if (!this.isConnected) return null
    
    try {
      const key = `user:${userId}:status`
      const cached = await this.client.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Error getting user online status:', error)
      return null
    }
  }

  async getBulkUserOnlineStatus(userIds) {
    if (!this.isConnected || !userIds.length) return {}
    
    try {
      const keys = userIds.map(id => `user:${id}:status`)
      const values = await this.client.mGet(keys)
      
      const result = {}
      userIds.forEach((userId, index) => {
        if (values[index]) {
          result[userId] = JSON.parse(values[index])
        }
      })
      
      return result
    } catch (error) {
      console.error('Error getting bulk user online status:', error)
      return {}
    }
  }

  // Chat list caching with 15-minute TTL
  async cacheUserChats(userId, chats) {
    if (!this.isConnected) return false
    
    try {
      const key = `user:${userId}:chats`
      const value = JSON.stringify(chats)
      await this.client.setEx(key, 900, value) // 15 minutes TTL
      return true
    } catch (error) {
      console.error('Error caching user chats:', error)
      return false
    }
  }

  async getUserChats(userId) {
    if (!this.isConnected) return null
    
    try {
      const key = `user:${userId}:chats`
      const cached = await this.client.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Error getting cached user chats:', error)
      return null
    }
  }

  async invalidateUserChatsCache(userId) {
    if (!this.isConnected) return false

    try {
      const key = `user:${userId}:chats`
      await this.client.del(key)
      return true
    } catch (error) {
      console.error('Error invalidating user chats cache:', error)
      return false
    }
  }

  async updateChatLastMessage(chatId, message) {
    if (!this.isConnected) {
      console.log('Redis not connected, skipping cache update')
      return false
    }

    try {
      console.log('Updating Redis cache for chat:', chatId, 'with message:', message.content.text)

      // Get all participants of the chat to update their cached chat lists
      const Chat = (await import('../models/Chat.js')).default
      const chat = await Chat.findById(chatId).select('participants')

      if (!chat) {
        console.log('Chat not found:', chatId)
        return false
      }

      console.log('Found chat with', chat.participants.length, 'participants')

      // Update cache for each participant
      for (const participant of chat.participants) {
        const userId = participant.user.toString()
        const key = `user:${userId}:chats`
        const cached = await this.client.get(key)

        if (cached) {
          const chats = JSON.parse(cached)
          const chatIndex = chats.findIndex(c => c.id === chatId)

          if (chatIndex !== -1) {
            console.log(`Updating cache for user ${userId}, chat index ${chatIndex}`)

            // Update the last message
            chats[chatIndex].lastMessage = {
              content: message.content.text,
              sender: message.sender.id,
              timestamp: message.createdAt
            }
            chats[chatIndex].lastActivity = message.createdAt

            // Re-cache the updated data
            await this.client.setEx(key, 900, JSON.stringify(chats)) // 15 minutes TTL
            console.log(`Cache updated for user ${userId}`)
          } else {
            console.log(`Chat ${chatId} not found in cached chats for user ${userId}`)
          }
        } else {
          console.log(`No cached chats found for user ${userId}`)
        }
      }

      return true
    } catch (error) {
      console.error('Error updating chat last message in cache:', error)
      return false
    }
  }

  // Chat metadata caching
  async cacheChatMetadata(chatId, metadata) {
    if (!this.isConnected) return false
    
    try {
      const key = `chat:${chatId}:metadata`
      const value = JSON.stringify(metadata)
      await this.client.setEx(key, 1800, value) // 30 minutes TTL
      return true
    } catch (error) {
      console.error('Error caching chat metadata:', error)
      return false
    }
  }

  async getChatMetadata(chatId) {
    if (!this.isConnected) return null
    
    try {
      const key = `chat:${chatId}:metadata`
      const cached = await this.client.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Error getting cached chat metadata:', error)
      return null
    }
  }

  // Typing indicators with 10-second TTL
  async setTypingIndicator(chatId, userId, isTyping) {
    if (!this.isConnected) return false
    
    try {
      const key = `chat:${chatId}:typing:${userId}`
      if (isTyping) {
        await this.client.setEx(key, 10, 'true') // 10 seconds TTL
      } else {
        await this.client.del(key)
      }
      return true
    } catch (error) {
      console.error('Error setting typing indicator:', error)
      return false
    }
  }

  async getTypingUsers(chatId) {
    if (!this.isConnected) return []
    
    try {
      const pattern = `chat:${chatId}:typing:*`
      const keys = await this.client.keys(pattern)
      return keys.map(key => key.split(':')[3]) // Extract userId from key
    } catch (error) {
      console.error('Error getting typing users:', error)
      return []
    }
  }

  // Unread count caching
  async setUnreadCount(chatId, userId, count) {
    if (!this.isConnected) return false
    
    try {
      const key = `chat:${chatId}:unread:${userId}`
      if (count > 0) {
        await this.client.setEx(key, 3600, count.toString()) // 1 hour TTL
      } else {
        await this.client.del(key)
      }
      return true
    } catch (error) {
      console.error('Error setting unread count:', error)
      return false
    }
  }

  async getUnreadCount(chatId, userId) {
    if (!this.isConnected) return 0
    
    try {
      const key = `chat:${chatId}:unread:${userId}`
      const count = await this.client.get(key)
      return count ? parseInt(count, 10) : 0
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }

  // Utility methods
  async flushDatabase() {
    if (!this.isConnected) return false
    
    try {
      await this.client.flushDb()
      return true
    } catch (error) {
      console.error('Error flushing Redis database:', error)
      return false
    }
  }

  async ping() {
    if (!this.isConnected) return false
    
    try {
      const result = await this.client.ping()
      return result === 'PONG'
    } catch (error) {
      console.error('Error pinging Redis:', error)
      return false
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      client: !!this.client
    }
  }
}

export default new RedisService()
