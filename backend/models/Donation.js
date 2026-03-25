// Donation model for MongoDB
const mongoose = require('mongoose')

const donationSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 10
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  userId: {
    type: String,
    required: true // Clerk user ID
  },
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'failed', 'pending'],
    default: 'completed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Donation', donationSchema)