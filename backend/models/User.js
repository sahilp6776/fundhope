// User model – tracks user profiles and admin actions
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    default: 'User'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  suspensionReason: {
    type: String,
    default: null
  },
  suspendedAt: {
    type: Date,
    default: null
  },
  suspendedBy: {
    type: String,
    default: null // Admin who suspended the user
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  }
})

module.exports = mongoose.model('User', userSchema)
