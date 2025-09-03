import express from 'express'
import {
  getUserChats,
  getChatById,
  createGroupChat,
  createIndividualChat,
  addParticipants,
  removeParticipant,
  updateChatSettings,
  deleteChat,
  searchUsers
} from '../controllers/chatController.js'
import {
  getChatMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  searchMessages,
  markAsRead
} from '../controllers/messageController.js'
import { authenticate } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validation.js'
import { body, param, query } from 'express-validator'

const router = express.Router()

// Apply authentication to all routes
router.use(authenticate)

// Chat routes
router.get('/', getUserChats)

router.get('/search-users', [
  query('query')
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters')
], validateRequest, searchUsers)

router.post('/individual', [
  body('participantId')
    .isMongoId()
    .withMessage('Valid participant ID is required')
], validateRequest, createIndividualChat)

router.post('/group', [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Chat name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('participantIds')
    .optional()
    .isArray()
    .withMessage('Participant IDs must be an array'),
  body('participantIds.*')
    .isMongoId()
    .withMessage('Each participant ID must be valid')
], validateRequest, createGroupChat)

router.get('/:chatId', [
  param('chatId')
    .isMongoId()
    .withMessage('Valid chat ID is required')
], validateRequest, getChatById)

router.put('/:chatId', [
  param('chatId')
    .isMongoId()
    .withMessage('Valid chat ID is required'),
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Chat name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
], validateRequest, updateChatSettings)

router.delete('/:chatId', [
  param('chatId')
    .isMongoId()
    .withMessage('Valid chat ID is required')
], validateRequest, deleteChat)

router.post('/:chatId/participants', [
  param('chatId')
    .isMongoId()
    .withMessage('Valid chat ID is required'),
  body('participantIds')
    .isArray({ min: 1 })
    .withMessage('At least one participant ID is required'),
  body('participantIds.*')
    .isMongoId()
    .withMessage('Each participant ID must be valid')
], validateRequest, addParticipants)

router.delete('/:chatId/participants/:participantId', [
  param('chatId')
    .isMongoId()
    .withMessage('Valid chat ID is required'),
  param('participantId')
    .isMongoId()
    .withMessage('Valid participant ID is required')
], validateRequest, removeParticipant)

// Message routes
router.get('/:chatId/messages', [
  param('chatId')
    .isMongoId()
    .withMessage('Valid chat ID is required'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
], validateRequest, getChatMessages)

router.post('/:chatId/messages', [
  param('chatId')
    .isMongoId()
    .withMessage('Valid chat ID is required'),
  body('content.text')
    .isLength({ min: 1, max: 4000 })
    .withMessage('Message content must be between 1 and 4000 characters'),
  body('content.type')
    .optional()
    .isIn(['text', 'image', 'file', 'audio', 'video', 'emoji'])
    .withMessage('Invalid message type'),
  body('replyTo')
    .optional()
    .isMongoId()
    .withMessage('Reply to must be a valid message ID')
], validateRequest, sendMessage)

router.get('/:chatId/messages/search', [
  param('chatId')
    .isMongoId()
    .withMessage('Valid chat ID is required'),
  query('query')
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
], validateRequest, searchMessages)

router.put('/:chatId/messages/:messageId', [
  param('chatId')
    .isMongoId()
    .withMessage('Valid chat ID is required'),
  param('messageId')
    .isMongoId()
    .withMessage('Valid message ID is required'),
  body('content')
    .isLength({ min: 1, max: 4000 })
    .withMessage('Message content must be between 1 and 4000 characters')
], validateRequest, editMessage)

router.delete('/:chatId/messages/:messageId', [
  param('chatId')
    .isMongoId()
    .withMessage('Valid chat ID is required'),
  param('messageId')
    .isMongoId()
    .withMessage('Valid message ID is required')
], validateRequest, deleteMessage)

router.post('/:chatId/messages/:messageId/reactions', [
  param('chatId')
    .isMongoId()
    .withMessage('Valid chat ID is required'),
  param('messageId')
    .isMongoId()
    .withMessage('Valid message ID is required'),
  body('emoji')
    .isLength({ min: 1, max: 10 })
    .withMessage('Emoji is required')
], validateRequest, addReaction)

router.delete('/:chatId/messages/:messageId/reactions', [
  param('chatId')
    .isMongoId()
    .withMessage('Valid chat ID is required'),
  param('messageId')
    .isMongoId()
    .withMessage('Valid message ID is required')
], validateRequest, removeReaction)

router.post('/:chatId/read', [
  param('chatId')
    .isMongoId()
    .withMessage('Valid chat ID is required')
], validateRequest, markAsRead)

export default router
