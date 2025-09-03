import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/common/Button'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Tooltip } from '@/components/common/Tooltip'
import apiService, { type Chat, type Message } from '../services/api'
import socketService from '../services/socket'

// Helper function to generate text-based avatar
const getTextAvatar = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

export const ChatPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [selectedChatId, setSelectedChatId] = useState<string>('')
  const [newMessage, setNewMessage] = useState<string>('')
  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null)

  // Ref for messages container to enable auto-scrolling
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom function
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  // Check authentication on mount
  useEffect(() => {
    if (!user || !apiService.isAuthenticated()) {
      navigate('/auth/login')
      return
    }
  }, [user, navigate])

  const selectedChat = chats.find(chat => chat.id === selectedChatId)

  // Send message function
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChatId) return

    try {
      // Send via Socket.IO for real-time delivery
      socketService.sendMessage(selectedChatId, { text: newMessage.trim() }, undefined, user)

      // Also send via API for persistence
      await apiService.sendMessage(selectedChatId, { text: newMessage.trim() })

      setNewMessage('')

      // Reset textarea height
      const textarea = document.querySelector('textarea')
      if (textarea) {
        textarea.style.height = '20px'
        textarea.style.overflow = 'hidden'
      }

      // Auto-scroll to bottom after sending message
      setTimeout(scrollToBottom, 100)
    } catch (err) {
      console.error('Failed to send message:', err)
      setError('Failed to send message')
    }
  }

  // Search users function
  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      setSearchLoading(true)
      const response = await apiService.searchUsers(query)
      if (response.success && response.data) {
        setSearchResults(response.data.users)
      }
    } catch (err) {
      console.error('Failed to search users:', err)
    } finally {
      setSearchLoading(false)
    }
  }

  // Create individual chat
  const createIndividualChat = async (userId: string) => {
    try {
      const response = await apiService.createIndividualChat(userId)
      if (response.success && response.data) {
        // Add new chat to the list
        setChats(prev => [response.data.chat, ...prev])
        setSelectedChatId(response.data.chat.id)
        setShowNewChatModal(false)
        setSearchQuery('')
        setSearchResults([])
      }
    } catch (err) {
      console.error('Failed to create chat:', err)
      setError('Failed to create chat')
    }
  }

  // Add reaction to message
  const addReaction = async (messageId: string, emoji: string) => {
    if (!selectedChatId) return

    try {
      await apiService.addReaction(selectedChatId, messageId, emoji)

      // Update local messages state
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              reactions: [
                ...msg.reactions.filter(r => r.user !== user?.id),
                { user: user?.id || '', emoji, createdAt: new Date().toISOString() }
              ]
            }
          : msg
      ))

      setShowReactionPicker(null)
    } catch (err) {
      console.error('Failed to add reaction:', err)
    }
  }

  // Remove reaction from message
  const removeReaction = async (messageId: string) => {
    if (!selectedChatId) return

    try {
      await apiService.removeReaction(selectedChatId, messageId)

      // Update local messages state
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              reactions: msg.reactions.filter(r => r.user !== user?.id)
            }
          : msg
      ))
    } catch (err) {
      console.error('Failed to remove reaction:', err)
    }
  }

  // Load chats on component mount
  useEffect(() => {
    const loadChats = async () => {
      if (!user || !apiService.isAuthenticated()) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await apiService.getChats()
        if (response.success && response.data) {
          console.log('📥 Loaded chats from API:', response.data.chats)
        // Log the structure of the first chat to see if participantId is present
        if (response.data.chats.length > 0) {
          console.log('📋 First chat structure:', response.data.chats[0])
        }
        setChats(response.data.chats)

          // Select first chat if available
          if (response.data.chats.length > 0 && !selectedChatId) {
            setSelectedChatId(response.data.chats[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to load chats:', err)
        setError('Failed to load chats')
      } finally {
        setLoading(false)
      }
    }

    loadChats()
  }, [user, selectedChatId])

  // Connect to Socket.IO
  useEffect(() => {
    const connectSocket = async () => {
      if (!user || !apiService.isAuthenticated()) {
        return
      }

      try {
        await socketService.connect()
        setIsConnected(true)

        // Set up event listeners
        socketService.on('new_message', (data) => {
          if (data.chatId === selectedChatId) {
            setMessages(prev => [...prev, data.message])
            // Auto-scroll to bottom when receiving new message
            setTimeout(scrollToBottom, 100)
          }

          // Update chat list with new last message and move to top
          setChats(prev => {
            const updatedChats = prev.map(chat =>
              chat.id === data.chatId
                ? {
                    ...chat,
                    lastMessage: {
                      content: data.message.content.text,
                      sender: data.message.sender.id,
                      timestamp: data.message.createdAt
                    },
                    lastActivity: data.message.createdAt
                  }
                : chat
            )

            // Move the updated chat to the top
            const updatedChatIndex = updatedChats.findIndex(chat => chat.id === data.chatId)
            if (updatedChatIndex > 0) {
              const updatedChat = updatedChats.splice(updatedChatIndex, 1)[0]
              updatedChats.unshift(updatedChat)
            }

            return updatedChats
          })
        })

        socketService.on('user_status_changed', (data) => {
          console.log('🔄 Received user status change:', data)

          // Update chats where the user is a participant
          setChats(prev => {
            console.log('📋 Current chats before update:', prev)
            const updatedChats = prev.map(chat => {
              // Check if this chat involves the user whose status changed
              // For individual chats, check if the chat's participant ID matches
              if (chat.type === 'individual' && (chat as any).participantId === data.userId) {
                console.log(`✅ Updating chat ${chat.id} for user ${data.userId}:`, {
                  oldStatus: chat.isOnline,
                  newStatus: data.isOnline,
                  lastSeen: data.lastSeen
                })
                return {
                  ...chat,
                  isOnline: data.isOnline,
                  lastSeen: data.lastSeen
                }
              }
              return chat
            })
            console.log('📋 Updated chats:', updatedChats)
            return updatedChats
          })

          // Note: Selected chat will be updated when the chats array is updated above
        })

        socketService.on('user_typing', (data) => {
          if (data.chatId === selectedChatId) {
            setTypingUsers(prev => {
              if (data.isTyping) {
                return prev.includes(data.userId) ? prev : [...prev, data.userId]
              } else {
                return prev.filter(id => id !== data.userId)
              }
            })
          }
        })

        socketService.on('error', (error) => {
          console.error('Socket error:', error)
          setError(error.message)
        })

      } catch (err) {
        console.error('Failed to connect to socket:', err)
        setError('Failed to connect to real-time messaging')
      }
    }

    if (user && apiService.isAuthenticated()) {
      connectSocket()
    }

    return () => {
      socketService.disconnect()
    }
  }, [user, selectedChatId])

  // Load messages when chat is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChatId || !user || !apiService.isAuthenticated()) return

      try {
        const response = await apiService.getChatMessages(selectedChatId)
        if (response.success && response.data) {
          setMessages(response.data.messages)
          // Auto-scroll to bottom after messages are loaded
          setTimeout(scrollToBottom, 100)
        }

        // Join the chat room
        socketService.joinChat(selectedChatId)

        // Mark messages as read
        await apiService.markAsRead(selectedChatId)

      } catch (err) {
        console.error('Failed to load messages:', err)
        setError('Failed to load messages')
      }
    }

    loadMessages()
  }, [selectedChatId, user])

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 50)
    }
  }, [messages])

  // Close reaction picker when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowReactionPicker(null)
    }

    if (showReactionPicker) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showReactionPicker])

  return (
    <div style={{
      height: '100vh',
      backgroundColor: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'var(--color-card)',
        borderBottom: '1px solid var(--color-border)',
        padding: 'var(--space-4) var(--space-6)',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '100%'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
            }}>
              <svg style={{ width: '18px', height: '18px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: '700',
                color: 'var(--color-text-primary)',
                margin: 0,
                letterSpacing: '-0.025em'
              }}>ZenTalk</h1>
              <p style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                margin: 0,
                fontWeight: '500'
              }}>Team Communication</p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)'
          }}>
            <div style={{
              textAlign: 'right',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end'
            }}>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
                margin: 0,
                lineHeight: '1.2'
              }}>
                {user?.firstName} {user?.lastName}
              </p>
              <p style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                margin: 0,
                lineHeight: '1.2'
              }}>@{user?.username}</p>
            </div>
            <div style={{
              width: '1px',
              height: '32px',
              backgroundColor: 'var(--color-border)',
              margin: '0 var(--space-2)'
            }} />
            <ThemeToggle size="sm" />
            <Button variant="ghost" onClick={logout} size="sm" style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)'
            }}>
              <svg style={{ width: '16px', height: '16px', marginRight: 'var(--space-2)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Chat Layout */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
      }}>
        {/* Chat Sidebar */}
        <div style={{
          width: '340px',
          backgroundColor: 'var(--color-card)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0
        }}>
          {/* Sidebar Header */}
          <div style={{
            padding: 'var(--space-6)',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-card)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            minHeight: '88px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-4)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)'
              }}>
                <div style={{
                  width: '8px',
                  height: '32px',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                  borderRadius: 'var(--radius-full)'
                }} />
                <h2 style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: '800',
                  color: 'var(--color-text-primary)',
                  margin: 0,
                  letterSpacing: '-0.025em'
                }}>
                  Messages
                </h2>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                <Tooltip content="New Chat - Start a new conversation" position="bottom">
                  <button
                    onClick={() => setShowNewChatModal(true)}
                    style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05) translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)'
                  }}
                  >
                    <svg style={{ width: '18px', height: '18px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </Tooltip>
              </div>
            </div>

            <div style={{
              position: 'relative'
            }}>
              <input
                type="text"
                placeholder="Search conversations..."
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4) var(--space-3) var(--space-12)',
                  backgroundColor: 'var(--color-surface)',
                  border: '2px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                  transition: 'all 0.2s ease-in-out',
                  boxSizing: 'border-box',
                  fontWeight: '500'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)'
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  e.target.style.backgroundColor = 'var(--color-background)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)'
                  e.target.style.boxShadow = 'none'
                  e.target.style.backgroundColor = 'var(--color-surface)'
                }}
              />
              <div style={{
                position: 'absolute',
                left: 'var(--space-4)',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-border)',
                transition: 'all 0.2s ease-in-out'
              }}>
                <svg style={{
                  width: '12px',
                  height: '12px',
                  color: 'var(--color-text-muted)'
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Chat List */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-3) var(--space-4)'
          }}>
            {loading ? (
              <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                Loading chats...
              </div>
            ) : error ? (
              <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-error)' }}>
                {error}
              </div>
            ) : chats.length === 0 ? (
              <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No chats yet. Start a new conversation!
              </div>
            ) : chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                style={{
                  padding: 'var(--space-4)',
                  cursor: 'pointer',
                  backgroundColor: selectedChatId === chat.id ? 'var(--color-primary)' : 'var(--color-card)',
                  borderRadius: 'var(--radius-xl)',
                  margin: '0 0 var(--space-3) 0',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  position: 'relative',
                  boxShadow: selectedChatId === chat.id
                    ? '0 8px 25px rgba(59, 130, 246, 0.15)'
                    : '0 2px 8px rgba(0, 0, 0, 0.04)',
                  border: selectedChatId === chat.id
                    ? '1px solid rgba(59, 130, 246, 0.2)'
                    : '1px solid var(--color-border)',
                  transform: selectedChatId === chat.id ? 'translateY(-2px)' : 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  if (selectedChatId !== chat.id) {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedChatId !== chat.id) {
                    e.currentTarget.style.backgroundColor = 'var(--color-card)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                {/* Avatar */}
                <div style={{
                  position: 'relative',
                  flexShrink: 0
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: selectedChatId === chat.id
                      ? 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)'
                      : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: '700',
                    boxShadow: selectedChatId === chat.id
                      ? '0 6px 20px rgba(255,255,255,0.25)'
                      : '0 4px 12px rgba(59, 130, 246, 0.2)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: selectedChatId === chat.id
                      ? '3px solid rgba(255,255,255,0.4)'
                      : '2px solid rgba(59, 130, 246, 0.1)',
                    letterSpacing: '-0.025em'
                  }}>
                    {getTextAvatar(chat.name)}
                  </div>

                  {/* Online Status */}
                  {chat.isOnline && (
                    <div style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '18px',
                      height: '18px',
                      backgroundColor: 'var(--color-success)',
                      borderRadius: '50%',
                      border: '3px solid var(--color-card)',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                      animation: selectedChatId === chat.id ? 'pulse 2s infinite' : 'none'
                    }} />
                  )}

                  {/* Group Indicator */}
                  {chat.type === 'group' && (
                    <div style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      width: '20px',
                      height: '20px',
                      background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-dark) 100%)',
                      borderRadius: '50%',
                      border: '2px solid var(--color-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
                    }}>
                      <svg style={{ width: '11px', height: '11px', color: 'white' }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2z"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Chat Info */}
                <div style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 'var(--space-2)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <h3 style={{
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: '700',
                      color: selectedChatId === chat.id ? 'white' : 'var(--color-text-primary)',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      letterSpacing: '-0.025em',
                      lineHeight: '1.2',
                      maxWidth: '70%'
                    }}>
                      {chat.name}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)'
                    }}>
                      <span style={{
                        fontSize: 'var(--font-size-xs)',
                        color: selectedChatId === chat.id ? 'rgba(255,255,255,0.8)' : 'var(--color-text-muted)',
                        fontWeight: '600',
                        letterSpacing: '0.025em'
                      }}>
                        {chat.lastMessage?.timestamp ? new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                      {chat.unreadCount > 0 && (
                        <div style={{
                          backgroundColor: selectedChatId === chat.id ? 'rgba(255,255,255,0.25)' : 'var(--color-error)',
                          color: 'white',
                          borderRadius: 'var(--radius-full)',
                          minWidth: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: '700',
                          padding: '0 var(--space-1)',
                          boxShadow: selectedChatId === chat.id
                            ? '0 2px 8px rgba(255,255,255,0.2)'
                            : '0 2px 8px rgba(239, 68, 68, 0.4)',
                          border: selectedChatId === chat.id ? '1px solid rgba(255,255,255,0.3)' : 'none'
                        }}>
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)'
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 'var(--font-size-sm)',
                        color: selectedChatId === chat.id ? 'rgba(255,255,255,0.85)' : 'var(--color-text-secondary)',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: '1.4',
                        fontWeight: chat.unreadCount > 0 ? '600' : '500'
                      }}>
                        {chat.lastMessage?.content || 'No messages yet'}
                      </p>
                      {!chat.isOnline && chat.lastSeen && (
                        <p style={{
                          fontSize: 'var(--font-size-xs)',
                          color: selectedChatId === chat.id ? 'rgba(255,255,255,0.6)' : 'var(--color-text-muted)',
                          margin: '2px 0 0 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          lineHeight: '1.2'
                        }}>
                          Last seen {new Date(chat.lastSeen).toLocaleString([], {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                    {chat.isOnline && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-success)',
                        flexShrink: 0,
                        boxShadow: '0 0 0 2px var(--color-card), 0 0 8px rgba(16, 185, 129, 0.3)'
                      }} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--color-background)'
        }}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div style={{
                padding: 'var(--space-6)',
                backgroundColor: 'var(--color-card)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                minHeight: '88px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)'
                }}>
                  <div style={{
                    position: 'relative'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: '700',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                      border: '2px solid rgba(59, 130, 246, 0.1)',
                      letterSpacing: '-0.025em'
                    }}>
                      {getTextAvatar(selectedChat.name)}
                    </div>
                    {selectedChat.isOnline && (
                      <div style={{
                        position: 'absolute',
                        bottom: '0px',
                        right: '0px',
                        width: '16px',
                        height: '16px',
                        backgroundColor: 'var(--color-success)',
                        borderRadius: '50%',
                        border: '3px solid var(--color-card)',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                      }} />
                    )}
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: 'var(--font-size-xl)',
                      fontWeight: '800',
                      color: 'var(--color-text-primary)',
                      margin: 0,
                      letterSpacing: '-0.025em',
                      lineHeight: '1.2'
                    }}>
                      {selectedChat.name}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      marginTop: 'var(--space-1)'
                    }}>
                      {selectedChat.isOnline ? (
                        <>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-success)',
                            boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)'
                          }} />
                          <span style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-success)',
                            fontWeight: '600'
                          }}>Online</span>
                        </>
                      ) : (
                        <span style={{
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--color-text-muted)',
                          fontWeight: '500'
                        }}>
                          Last seen {selectedChat.lastSeen ? new Date(selectedChat.lastSeen).toLocaleString([], {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Unknown'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)'
                }}>
                  <Tooltip content="Voice Call - Start an audio call" position="bottom">
                    <button style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--color-surface)',
                      border: '2px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)'
                      e.currentTarget.style.borderColor = 'var(--color-primary)'
                      e.currentTarget.style.transform = 'scale(1.05) translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
                      const svg = e.currentTarget.querySelector('svg')
                      if (svg) svg.style.color = 'white'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)'
                      e.currentTarget.style.borderColor = 'var(--color-border)'
                      e.currentTarget.style.transform = 'scale(1) translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                      const svg = e.currentTarget.querySelector('svg')
                      if (svg) svg.style.color = 'var(--color-text-muted)'
                    }}
                    >
                      <svg style={{ width: '18px', height: '18px', color: 'var(--color-text-muted)', transition: 'color 0.2s ease-in-out' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </button>
                  </Tooltip>
                  <Tooltip content="Video Call - Start a video call" position="bottom">
                    <button style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--color-surface)',
                      border: '2px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)'
                      e.currentTarget.style.borderColor = 'var(--color-primary)'
                      e.currentTarget.style.transform = 'scale(1.05) translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
                      const svg = e.currentTarget.querySelector('svg')
                      if (svg) svg.style.color = 'white'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)'
                      e.currentTarget.style.borderColor = 'var(--color-border)'
                      e.currentTarget.style.transform = 'scale(1) translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                      const svg = e.currentTarget.querySelector('svg')
                      if (svg) svg.style.color = 'var(--color-text-muted)'
                    }}
                    >
                      <svg style={{ width: '18px', height: '18px', color: 'var(--color-text-muted)', transition: 'color 0.2s ease-in-out' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </Tooltip>
                  <Tooltip content="More Options - Chat settings and options" position="bottom">
                    <button style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--color-surface)',
                      border: '2px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)'
                      e.currentTarget.style.borderColor = 'var(--color-primary)'
                      e.currentTarget.style.transform = 'scale(1.05) translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
                      const svg = e.currentTarget.querySelector('svg')
                      if (svg) svg.style.color = 'white'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)'
                      e.currentTarget.style.borderColor = 'var(--color-border)'
                      e.currentTarget.style.transform = 'scale(1) translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                      const svg = e.currentTarget.querySelector('svg')
                      if (svg) svg.style.color = 'var(--color-text-muted)'
                    }}
                    >
                      <svg style={{ width: '18px', height: '18px', color: 'var(--color-text-muted)', transition: 'color 0.2s ease-in-out' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Messages Area */}
              <div
                ref={messagesContainerRef}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: 'var(--space-4) var(--space-6)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)'
                }}>
                {messages.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    color: 'var(--color-text-muted)',
                    padding: 'var(--space-8)',
                    fontSize: 'var(--font-size-lg)'
                  }}>
                    {selectedChat ? 'No messages yet. Start the conversation!' : 'Select a chat to view messages'}
                  </div>
                ) : messages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      display: 'flex',
                      justifyContent: message.sender.id === user?.id ? 'flex-end' : 'flex-start',
                      alignItems: 'flex-end',
                      gap: 'var(--space-2)'
                    }}
                  >
                    {message.sender.id !== user?.id && (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '600',
                        flexShrink: 0,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {getTextAvatar(`${message.sender.firstName} ${message.sender.lastName}`)}
                      </div>
                    )}
                    <div style={{
                      maxWidth: '70%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: message.sender.id === user?.id ? 'flex-end' : 'flex-start'
                    }}>
                      <div style={{
                        backgroundColor: message.sender.id === user?.id ? 'var(--color-primary)' : 'var(--color-surface)',
                        color: message.sender.id === user?.id ? 'white' : 'var(--color-text-primary)',
                        padding: 'var(--space-3) var(--space-4)',
                        borderRadius: 'var(--radius-lg)',
                        borderBottomRightRadius: message.sender.id === user?.id ? 'var(--radius-sm)' : 'var(--radius-lg)',
                        borderBottomLeftRadius: message.sender.id === user?.id ? 'var(--radius-lg)' : 'var(--radius-sm)',
                        fontSize: 'var(--font-size-sm)',
                        lineHeight: '1.4'
                      }}>
                        {message.content.text}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        marginTop: 'var(--space-1)',
                        paddingLeft: message.sender.id === user?.id ? 0 : 'var(--space-2)',
                        paddingRight: message.sender.id === user?.id ? 'var(--space-2)' : 0
                      }}>
                        <span style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-muted)',
                          fontWeight: '500'
                        }}>
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        {/* Reaction Button */}
                        <button
                          onClick={() => setShowReactionPicker(showReactionPicker === message.id ? null : message.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 'var(--space-1)',
                            borderRadius: '50%',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-muted)',
                            transition: 'all 0.2s ease-in-out',
                            opacity: 0.7
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-surface)'
                            e.currentTarget.style.opacity = '1'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.opacity = '0.7'
                          }}
                        >
                          😊
                        </button>
                      </div>

                      {/* Reactions Display */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 'var(--space-1)',
                          marginTop: 'var(--space-2)',
                          paddingLeft: message.sender.id === user?.id ? 0 : 'var(--space-2)',
                          paddingRight: message.sender.id === user?.id ? 'var(--space-2)' : 0
                        }}>
                          {Object.entries(
                            message.reactions.reduce((acc: Record<string, number>, reaction) => {
                              acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1
                              return acc
                            }, {})
                          ).map(([emoji, count]) => {
                            const userReacted = message.reactions.some(r => r.user === user?.id && r.emoji === emoji)
                            return (
                              <button
                                key={emoji}
                                onClick={() => userReacted ? removeReaction(message.id) : addReaction(message.id, emoji)}
                                style={{
                                  background: userReacted ? 'var(--color-primary)' : 'var(--color-surface)',
                                  color: userReacted ? 'white' : 'var(--color-text-primary)',
                                  border: `1px solid ${userReacted ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                  borderRadius: 'var(--radius-full)',
                                  padding: 'var(--space-1) var(--space-2)',
                                  fontSize: 'var(--font-size-xs)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease-in-out',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 'var(--space-1)'
                                }}
                                onMouseEnter={(e) => {
                                  if (!userReacted) {
                                    e.currentTarget.style.backgroundColor = 'var(--color-primary)'
                                    e.currentTarget.style.color = 'white'
                                    e.currentTarget.style.borderColor = 'var(--color-primary)'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!userReacted) {
                                    e.currentTarget.style.backgroundColor = 'var(--color-surface)'
                                    e.currentTarget.style.color = 'var(--color-text-primary)'
                                    e.currentTarget.style.borderColor = 'var(--color-border)'
                                  }
                                }}
                              >
                                <span>{emoji}</span>
                                <span>{count}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}

                      {/* Reaction Picker */}
                      {showReactionPicker === message.id && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: message.sender.id === user?.id ? 'auto' : '0',
                          right: message.sender.id === user?.id ? '0' : 'auto',
                          marginTop: 'var(--space-2)',
                          backgroundColor: 'var(--color-card)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-lg)',
                          padding: 'var(--space-2)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          display: 'flex',
                          gap: 'var(--space-1)',
                          zIndex: 10
                        }}>
                          {['👍', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => addReaction(message.id, emoji)}
                              style={{
                                background: 'none',
                                border: 'none',
                                fontSize: 'var(--font-size-lg)',
                                cursor: 'pointer',
                                padding: 'var(--space-2)',
                                borderRadius: 'var(--radius-md)',
                                transition: 'all 0.2s ease-in-out'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--color-surface)'
                                e.currentTarget.style.transform = 'scale(1.2)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                                e.currentTarget.style.transform = 'scale(1)'
                              }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {message.sender.id === user?.id && (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-dark) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '600',
                        flexShrink: 0,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {getTextAvatar(user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'You')}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicators */}
                {typingUsers.length > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-end',
                    gap: 'var(--space-2)',
                    marginTop: 'var(--space-4)'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-dark) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: '600',
                      flexShrink: 0
                    }}>
                      ...
                    </div>
                    <div style={{
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-muted)',
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border)',
                      fontSize: 'var(--font-size-sm)',
                      fontStyle: 'italic'
                    }}>
                      {typingUsers.length === 1 ? 'Someone is typing...' : `${typingUsers.length} people are typing...`}
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div style={{
                padding: 'var(--space-4) var(--space-6) var(--space-5)',
                backgroundColor: 'var(--color-card)',
                borderTop: '1px solid var(--color-border)',
                boxShadow: '0 -1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  maxWidth: '100%'
                }}>
                  {/* Attachment Button */}
                  <Tooltip content="Attach Files - Send photos, documents, and files" position="top">
                    <button style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)'
                      e.currentTarget.style.borderColor = 'var(--color-primary)'
                      e.currentTarget.style.transform = 'scale(1.05)'
                      const svg = e.currentTarget.querySelector('svg')
                      if (svg) svg.style.color = 'white'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)'
                      e.currentTarget.style.borderColor = 'var(--color-border)'
                      e.currentTarget.style.transform = 'scale(1)'
                      const svg = e.currentTarget.querySelector('svg')
                      if (svg) svg.style.color = 'var(--color-text-muted)'
                    }}
                    >
                      <svg style={{ width: '20px', height: '20px', color: 'var(--color-text-muted)', transition: 'color 0.2s ease-in-out' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>
                  </Tooltip>

                  {/* Emoji Button */}
                  <Tooltip content="Add Emoji - Express yourself with emojis" position="top">
                    <button style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)'
                      e.currentTarget.style.borderColor = 'var(--color-primary)'
                      e.currentTarget.style.transform = 'scale(1.05)'
                      const svg = e.currentTarget.querySelector('svg')
                      if (svg) svg.style.color = 'white'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)'
                      e.currentTarget.style.borderColor = 'var(--color-border)'
                      e.currentTarget.style.transform = 'scale(1)'
                      const svg = e.currentTarget.querySelector('svg')
                      if (svg) svg.style.color = 'var(--color-text-muted)'
                    }}
                    >
                      <svg style={{ width: '20px', height: '20px', color: 'var(--color-text-muted)', transition: 'color 0.2s ease-in-out' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                      </svg>
                    </button>
                  </Tooltip>

                  {/* Message Input Container */}
                  <div style={{
                    flex: 1,
                    position: 'relative',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-xl)',
                    border: '2px solid var(--color-border)',
                    transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <textarea
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value)

                        // Auto-resize textarea
                        const target = e.target as HTMLTextAreaElement
                        target.style.height = '20px'
                        target.style.height = `${Math.min(target.scrollHeight, 120)}px`
                        target.style.overflow = target.scrollHeight > 120 ? 'auto' : 'hidden'

                        // Handle typing indicators
                        if (selectedChatId && e.target.value.trim()) {
                          socketService.handleTyping(selectedChatId)
                        } else if (selectedChatId) {
                          socketService.stopTypingImmediate(selectedChatId)
                        }
                      }}
                      placeholder="Type a message..."
                      style={{
                        width: '100%',
                        height: '48px',
                        minHeight: '20px',
                        maxHeight: '96px',
                        padding: 'var(--space-3) var(--space-4)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-xl)',
                        fontSize: 'var(--font-size-base)',
                        color: 'var(--color-text-primary)',
                        resize: 'none',
                        outline: 'none',
                        fontFamily: 'inherit',
                        lineHeight: '1.5',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'var(--color-border) transparent',
                        verticalAlign: 'middle'
                      }}
                      onFocus={(e) => {
                        if (e.target.parentElement) {
                          e.target.parentElement.style.borderColor = 'var(--color-primary)'
                          e.target.parentElement.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.parentElement) {
                          e.target.parentElement.style.borderColor = 'var(--color-border)'
                          e.target.parentElement.style.boxShadow = 'none'
                        }
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement

                        // Store current scroll position
                        const scrollTop = target.scrollTop

                        // Reset height to calculate new scroll height
                        target.style.height = '20px'

                        // Calculate new height based on content
                        const newHeight = Math.min(Math.max(target.scrollHeight, 20), 96)
                        target.style.height = newHeight + 'px'

                        // Restore scroll position
                        target.scrollTop = scrollTop

                        // Show scrollbar if content exceeds max height
                        if (target.scrollHeight > 96) {
                          target.style.overflow = 'auto'
                        } else {
                          target.style.overflow = 'hidden'
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                    />
                  </div>

                  {/* Mic Button */}
                  <Tooltip content="Voice Message - Record and send voice message" position="top">
                    <button style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)'
                      e.currentTarget.style.borderColor = 'var(--color-primary)'
                      e.currentTarget.style.transform = 'scale(1.05)'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)'
                      const svg = e.currentTarget.querySelector('svg')
                      if (svg) svg.style.color = 'white'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)'
                      e.currentTarget.style.borderColor = 'var(--color-border)'
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.boxShadow = 'none'
                      const svg = e.currentTarget.querySelector('svg')
                      if (svg) svg.style.color = 'var(--color-text-muted)'
                    }}
                    >
                      <svg style={{ width: '20px', height: '20px', color: 'var(--color-text-muted)', transition: 'color 0.2s ease-in-out' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </button>
                  </Tooltip>

                  {/* Send Button */}
                  <Tooltip content={newMessage.trim() ? "Send Message - Click to send your message" : "Send Message - Type a message first"} position="top">
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        padding: 0,
                        border: 'none',
                        background: newMessage.trim()
                          ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)'
                          : 'var(--color-surface)',
                        cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease-in-out',
                        flexShrink: 0,
                        boxShadow: newMessage.trim() ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none',
                        opacity: newMessage.trim() ? 1 : 0.6
                      }}
                      onMouseEnter={(e) => {
                        if (newMessage.trim()) {
                          e.currentTarget.style.transform = 'scale(1.05)'
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (newMessage.trim()) {
                          e.currentTarget.style.transform = 'scale(1)'
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)'
                        }
                      }}
                    >
                      <svg style={{
                        width: '20px',
                        height: '20px',
                        color: newMessage.trim() ? 'white' : 'var(--color-text-muted)',
                        transform: 'rotate(45deg)',
                        transition: 'color 0.2s ease-in-out'
                      }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </Tooltip>
                </div>
              </div>
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              color: 'var(--color-text-muted)'
            }}>
              <svg style={{ width: '64px', height: '64px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: '600',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Welcome to ZenTalk
                </h3>
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-muted)'
                }}>
                  Select a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--color-card)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-4)'
            }}>
              <h2 style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: '700',
                color: 'var(--color-text-primary)',
                margin: 0
              }}>
                Start New Chat
              </h2>
              <button
                onClick={() => {
                  setShowNewChatModal(false)
                  setSearchQuery('')
                  setSearchResults([])
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 'var(--font-size-xl)',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: 'var(--space-2)',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface)'
                  e.currentTarget.style.color = 'var(--color-text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--color-text-muted)'
                }}
              >
                ×
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
              <input
                type="text"
                placeholder="Search users by name or username..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  searchUsers(e.target.value)
                }}
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4) var(--space-3) var(--space-12)',
                  backgroundColor: 'var(--color-surface)',
                  border: '2px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                  transition: 'all 0.2s ease-in-out',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)'
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <div style={{
                position: 'absolute',
                left: 'var(--space-4)',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)'
              }}>
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Search Results */}
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              {searchLoading ? (
                <div style={{
                  textAlign: 'center',
                  padding: 'var(--space-4)',
                  color: 'var(--color-text-muted)'
                }}>
                  Searching...
                </div>
              ) : searchQuery.length < 2 ? (
                <div style={{
                  textAlign: 'center',
                  padding: 'var(--space-4)',
                  color: 'var(--color-text-muted)'
                }}>
                  Type at least 2 characters to search for users
                </div>
              ) : searchResults.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: 'var(--space-4)',
                  color: 'var(--color-text-muted)'
                }}>
                  No users found
                </div>
              ) : (
                searchResults.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => createIndividualChat(user.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      marginBottom: 'var(--space-2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 'var(--font-size-base)',
                      fontWeight: '700'
                    }}>
                      {getTextAvatar(`${user.firstName} ${user.lastName}`)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 'var(--font-size-base)',
                        fontWeight: '600',
                        color: 'var(--color-text-primary)',
                        marginBottom: 'var(--space-1)'
                      }}>
                        {user.firstName} {user.lastName}
                      </div>
                      <div style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-muted)'
                      }}>
                        @{user.username}
                      </div>
                    </div>
                    {user.isOnline && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-success)'
                      }} />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
