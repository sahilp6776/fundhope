// Notification model – tracks notifications sent to users
const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true // Clerk user ID
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  type: {
    type: String,
    enum: ['approved', 'rejected', 'reminder', 'update'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Notification', notificationSchema)
