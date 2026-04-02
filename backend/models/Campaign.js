// Campaign model for MongoDB
const mongoose = require('mongoose')

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  description: {
    type: String,
    required: true,
    maxLength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['Education', 'Health', 'Medical', 'Environment', 'Disaster Relief', 'Community', 'Other']
  },
  goalAmount: {
    type: Number,
    required: true,
    min: 100
  },
  currentAmount: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdBy: {
    type: String,
    required: true // Clerk user ID
  },
  creatorName: {
    type: String,
    default: 'Anonymous'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  approvedBy: {
    type: String,
    default: null // Clerk user ID of the admin who approved
  },
  approvedByName: {
    type: String,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  approvalNotes: {
    type: String,
    maxLength: 500
  },
  rejectionReason: {
    type: String,
    maxLength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Update the updatedAt field before saving
campaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model('Campaign', campaignSchema)