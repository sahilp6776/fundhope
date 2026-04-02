require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const { connectDB } = require('./config/mongo')

const paymentRoutes = require('./routes/payments')
const campaignRoutes = require('./routes/campaigns')
const adminRoutes = require('./routes/admin')
const notificationRoutes = require('./routes/notifications')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'FundHope API running 🚀' })
})

app.use('/api/payments', paymentRoutes)
app.use('/api/campaigns', campaignRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/notifications', notificationRoutes)

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`)
  })
}).catch(err => {
  console.error('DB connection failed:', err)
})
