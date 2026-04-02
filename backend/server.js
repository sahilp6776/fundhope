// FundHope Backend Server – Express.js REST API
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const { Server } = require('socket.io')
const { connectDB } = require('./config/mongo')

// Clerk middleware – required for authentication
const { clerkMiddleware, requireAuth } = require('@clerk/express')

// Route imports
const paymentRoutes = require('./routes/payments')
const campaignRoutes = require('./routes/campaigns')
const adminRoutes = require('./routes/admin')
const notificationRoutes = require('./routes/notifications')

const app = express()
const PORT = process.env.PORT || 5000

// ===== SECURITY MIDDLEWARE =====

// Set security HTTP headers
app.use(helmet())

// Enable CORS – allow frontend origin only
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3001',
  'http://localhost:3000',
  'http://localhost:3001',
]
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

// Apply Clerk middleware to extract auth from requests
app.use(clerkMiddleware())

// Rate limiting – prevent abuse (100 requests per 15 min per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
})
app.use('/api/', limiter)

// Stricter rate limit for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  message: { error: 'Too many payment requests' },
})
app.use('/api/payments/', paymentLimiter)

// ===== GENERAL MIDDLEWARE =====
app.use(express.json({ limit: '10mb' }))
app.use(morgan('dev')) // HTTP request logging

// ===== HEALTH CHECK =====
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'FundHope API is running', version: '1.0.0' })
})

// ===== API ROUTES =====
app.use('/api/payments', paymentRoutes)
app.use('/api/campaigns', campaignRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/notifications', notificationRoutes)

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ===== GLOBAL ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

// ===== START SERVER =====
connectDB().then(() => {
  const http = require('http').createServer(app)
  const io = new Server(http, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  })

  // Store io instance globally for use in routes
  app.locals.io = io

  // Socket.IO connection handler
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId

    if (userId) {
      // Join user-specific room for notifications
      socket.join(`user:${userId}`)
    }

    // Heartbeat to detect disconnections
    socket.on('ping', () => {
      socket.emit('pong')
    })

    // Cleanup on disconnect
    socket.on('disconnect', () => {
      // User-specific room automatically cleaned up
    })
  })

  http.listen(PORT, () => {
    console.log(`✅ FundHope Backend running on port ${PORT}`)
    console.log(`✅ WebSocket (Socket.IO) ready for real-time notifications`)
  })
}).catch(err => {
  console.error('❌ Failed to connect to database:', err)
  process.exit(1)
})
