import { io, Socket } from 'socket.io-client'
import apiService from './api'
import type { Message, Chat } from './api'

export interface SocketEvents {
  // Connection events
  connect: () => void
  disconnect: () => void
  error: (error: { message: string }) => void

  // Chat events
  joined_chat: (data: { chatId: string }) => void
  left_chat: (data: { chatId: string }) => void
  new_message: (data: { message: Message; chatId: string }) => void

  // User events
  user_status_changed: (data: { userId: string; isOnline: boolean; lastSeen: string }) => void
  user_typing: (data: { userId: string; chatId: string; isTyping: boolean }) => void

  // Message events
  message_read: (data: { messageId: string; userId: string; chatId: string }) => void
  chat_read: (data: { userId: string; chatId: string }) => void
}

class SocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private eventListeners: Map<string, Function[]> = new Map()

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve()
        return
      }

      const token = apiService.getAuthToken()
      if (!token) {
        reject(new Error('No authentication token available'))
        return
      }

      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000'

      this.socket = io(socketUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay
      })

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id)
        this.reconnectAttempts = 0
        this.emit('connect')
        resolve()
      })

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
        this.emit('disconnect')
      })

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        this.reconnectAttempts++
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect after maximum attempts'))
        }
      })

      this.socket.on('error', (error) => {
        console.error('Socket error:', error)
        this.emit('error', error)
      })

      // Message events
      this.socket.on('new_message', (data) => {
        this.emit('new_message', data)
      })

      this.socket.on('message_read', (data) => {
        this.emit('message_read', data)
      })

      this.socket.on('chat_read', (data) => {
        this.emit('chat_read', data)
      })

      // User events
      this.socket.on('user_status_changed', (data) => {
        this.emit('user_status_changed', data)
      })

      this.socket.on('user_typing', (data) => {
        this.emit('user_typing', data)
      })

      // Chat events
      this.socket.on('joined_chat', (data) => {
        this.emit('joined_chat', data)
      })

      this.socket.on('left_chat', (data) => {
        this.emit('left_chat', data)
      })
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.eventListeners.clear()
  }

  // Event handling
  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]): void {
    const listeners = this.eventListeners.get(event)
    if (!listeners) return

    if (callback) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    } else {
      this.eventListeners.set(event, [])
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  // Chat methods
  joinChat(chatId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join_chat', { chatId })
    }
  }

  leaveChat(chatId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave_chat', { chatId })
    }
  }

  sendMessage(chatId: string, content: { text: string; type?: string; attachments?: any[] }, replyTo?: string, user?: any): void {
    if (this.socket?.connected) {
      this.socket.emit('send_message', { chatId, content, replyTo, user })
    }
  }

  // Typing indicators
  startTyping(chatId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing_start', { chatId })
    }
  }

  stopTyping(chatId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing_stop', { chatId })
    }
  }

  // Read receipts
  markMessageAsRead(chatId: string, messageId?: string): void {
    if (this.socket?.connected) {
      this.socket.emit('message_read', { chatId, messageId })
    }
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getSocketId(): string | undefined {
    return this.socket?.id
  }

  // Reconnection methods
  forceReconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket.connect()
    }
  }

  // Typing management
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map()

  handleTyping(chatId: string): void {
    // Clear existing timeout
    const existingTimeout = this.typingTimeouts.get(chatId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Start typing
    this.startTyping(chatId)

    // Set timeout to stop typing
    const timeout = setTimeout(() => {
      this.stopTyping(chatId)
      this.typingTimeouts.delete(chatId)
    }, 3000) // Stop typing after 3 seconds of inactivity

    this.typingTimeouts.set(chatId, timeout)
  }

  stopTypingImmediate(chatId: string): void {
    const timeout = this.typingTimeouts.get(chatId)
    if (timeout) {
      clearTimeout(timeout)
      this.typingTimeouts.delete(chatId)
    }
    this.stopTyping(chatId)
  }
}

export default new SocketService()
