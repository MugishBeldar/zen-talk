import Joi from 'joi';
import { validationResult } from 'express-validator';

/**
 * Express-validator middleware for handling validation results
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Generic validation middleware
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      // Pass the original Joi error to the error handler
      // The error handler will format it properly
      return next(error);
    }

    // Replace the original data with validated data
    req[property] = value;
    next();
  };
};

/**
 * User registration validation schema
 */
export const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(20)
    .required()
    .messages({
      'string.alphanum': 'Username must contain only letters and numbers',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username cannot exceed 20 characters',
      'any.required': 'Username is required'
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(254)
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.max': 'Email cannot exceed 254 characters',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password cannot exceed 128 characters',
      'any.required': 'Password is required'
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    }),

  firstName: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'First name is required',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required'
    }),

  lastName: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'Last name is required',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required'
    })
});

/**
 * User login validation schema
 */
export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .min(1)
    .max(128)
    .required()
    .messages({
      'string.min': 'Password is required',
      'any.required': 'Password is required'
    }),

  rememberMe: Joi.boolean()
    .default(false)
});

/**
 * Refresh token validation schema
 */
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required'
    })
});

/**
 * Profile update validation schema
 */
export const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.min': 'First name cannot be empty',
      'string.max': 'First name cannot exceed 50 characters'
    }),

  lastName: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Last name cannot be empty',
      'string.max': 'Last name cannot exceed 50 characters'
    }),

  bio: Joi.string()
    .trim()
    .max(160)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Bio cannot exceed 160 characters'
    }),

  avatar: Joi.string()
    .uri()
    .max(500)
    .optional()
    .messages({
      'string.uri': 'Avatar must be a valid URL',
      'string.max': 'Avatar URL cannot exceed 500 characters'
    })
});

/**
 * Password change validation schema
 */
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),

  newPassword: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters',
      'string.max': 'New password cannot exceed 128 characters',
      'any.required': 'New password is required'
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    })
});

/**
 * Forgot password validation schema (simple version with old password)
 */
export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

  oldPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),

  newPassword: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters',
      'string.max': 'New password cannot exceed 128 characters',
      'any.required': 'New password is required'
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    })
});



/**
 * User preferences validation schema
 */
export const updatePreferencesSchema = Joi.object({
  theme: Joi.string()
    .valid('light', 'dark', 'auto')
    .optional(),

  language: Joi.string()
    .max(5)
    .optional(),

  timezone: Joi.string()
    .max(50)
    .optional(),

  notifications: Joi.object({
    email: Joi.object({
      messages: Joi.boolean().optional(),
      mentions: Joi.boolean().optional(),
      groupInvites: Joi.boolean().optional(),
      newsletter: Joi.boolean().optional()
    }).optional(),

    push: Joi.object({
      messages: Joi.boolean().optional(),
      mentions: Joi.boolean().optional(),
      groupInvites: Joi.boolean().optional()
    }).optional(),

    inApp: Joi.object({
      sound: Joi.boolean().optional(),
      desktop: Joi.boolean().optional(),
      vibration: Joi.boolean().optional()
    }).optional()
  }).optional(),

  privacy: Joi.object({
    showOnlineStatus: Joi.boolean().optional(),
    showLastSeen: Joi.boolean().optional(),
    allowDirectMessages: Joi.boolean().optional(),
    profileVisibility: Joi.string().valid('public', 'friends', 'private').optional(),
    readReceipts: Joi.boolean().optional()
  }).optional(),

  chat: Joi.object({
    enterToSend: Joi.boolean().optional(),
    showTypingIndicators: Joi.boolean().optional(),
    autoDownloadMedia: Joi.boolean().optional(),
    fontSize: Joi.string().valid('small', 'medium', 'large').optional(),
    messageGrouping: Joi.boolean().optional()
  }).optional()
});

/**
 * Pagination validation schema
 */
export const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),

  sort: Joi.string()
    .optional(),

  order: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
});

/**
 * Search validation schema
 */
export const searchSchema = Joi.object({
  q: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Search query is required',
      'string.max': 'Search query cannot exceed 100 characters',
      'any.required': 'Search query is required'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10),

  offset: Joi.number()
    .integer()
    .min(0)
    .default(0)
});

// Export validation middleware functions
export const validateRegister = validate(registerSchema);
export const validateLogin = validate(loginSchema);
export const validateRefreshToken = validate(refreshTokenSchema);
export const validateUpdateProfile = validate(updateProfileSchema);
export const validateChangePassword = validate(changePasswordSchema);
export const validateForgotPassword = validate(forgotPasswordSchema);
export const validateUpdatePreferences = validate(updatePreferencesSchema);
export const validatePagination = validate(paginationSchema, 'query');
export const validateSearch = validate(searchSchema, 'query');

export default {
  validate,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
  updatePreferencesSchema,
  paginationSchema,
  searchSchema,
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateUpdateProfile,
  validateChangePassword,
  validateForgotPassword,
  validateUpdatePreferences,
  validatePagination,
  validateSearch
};
