import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_PRIVATE_KEY',
  'JWT_PUBLIC_KEY',
  'BCRYPT_SALT_ROUNDS',
  'SESSION_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Environment configuration
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '8000', 10),
  MONGODB_URI: process.env.MONGODB_URI,
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY,
  JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY,
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

// Database configuration
export const databaseConfig = {
  uri: env.MONGODB_URI,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    retryWrites: true
  }
};

// JWT configuration
export const jwtConfig = {
  privateKey: env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n'),
  publicKey: env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n'),
  issuer: process.env.JWT_ISSUER || 'zentalk-api',
  audience: process.env.JWT_AUDIENCE || 'zentalk-client',
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  algorithm: 'RS256'
};

// Rate limiting configuration
export const rateLimitConfig = {
  // Authentication endpoints
  auth: {
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5', 10),
      skipSuccessfulRequests: true,
      standardHeaders: true,
      legacyHeaders: false
    },
    
    register: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3,
      skipSuccessfulRequests: true,
      standardHeaders: true,
      legacyHeaders: false
    },
    
    refresh: {
      windowMs: 60 * 1000, // 1 minute
      max: 10,
      skipSuccessfulRequests: true,
      standardHeaders: true,
      legacyHeaders: false
    }
  },
  
  // General API endpoints
  api: {
    windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW || '15', 10) * 60 * 1000,
    max: parseInt(process.env.API_RATE_LIMIT_MAX || '1000', 10),
    standardHeaders: true,
    legacyHeaders: false
  }
};

// CORS configuration
export const corsConfig = {
  origin: (origin, callback) => {
    const allowedOrigins = env.CORS_ORIGIN.split(',').map(origin => origin.trim());
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: process.env.CORS_CREDENTIALS === 'true',
  optionsSuccessStatus: 200,
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Device-ID',
    'X-Session-ID'
  ],
  preflightContinue: false,
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Request-ID'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  maxAge: 86400 // 24 hours
};

// Security configuration
export const securityConfig = {
  bcrypt: {
    saltRounds: env.BCRYPT_SALT_ROUNDS
  },
  
  session: {
    secret: process.env.SESSION_SECRET,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxDevicesPerUser: parseInt(process.env.MAX_DEVICES_PER_USER || '5', 10)
  },
  
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }
};

// Logging configuration
export const loggingConfig = {
  level: env.LOG_LEVEL,
  file: process.env.LOG_FILE || './logs/app.log',
  enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true',
  enableMorganLogging: process.env.ENABLE_MORGAN_LOGGING === 'true'
};

// Development configuration
export const developmentConfig = {
  enableSwagger: process.env.ENABLE_SWAGGER === 'true',
  enableDebugRoutes: process.env.ENABLE_DEBUG_ROUTES === 'true',
  trustProxy: process.env.TRUST_PROXY === 'true'
};

// Export all configurations
export const config = {
  env,
  database: databaseConfig,
  jwt: jwtConfig,
  rateLimit: rateLimitConfig,
  cors: corsConfig,
  security: securityConfig,
  logging: loggingConfig,
  development: developmentConfig
};

export default config;
