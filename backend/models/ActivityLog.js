// Activity Log model – tracks campaign approvals, rejections, and admin actions
const mongoose = require('mongoose')

const activityLogSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  campaignTitle: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['created', 'approved', 'rejected', 'deleted', 'updated'],
    required: true
  },
  performedBy: {
    type: String,
    required: true // Clerk user ID
  },
  performedByName: {
    type: String,
    default: 'System'
  },
  comments: {
    type: String,
    maxLength: 500
  },
  previousStatus: {
    type: String,
    default: null
  },
  newStatus: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('ActivityLog', activityLogSchema)
