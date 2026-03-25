// Notification API routes – user notifications
const express = require('express')
const router = express.Router()
const { requireAuth } = require('@clerk/express')
const Notification = require('../models/Notification')

// GET /api/notifications – get all notifications for current user
router.get('/', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId
    const notifications = await Notification.find({ userId })
      .populate('campaignId', 'title')
      .sort({ createdAt: -1 })
    
    const unreadCount = notifications.filter(n => !n.read).length

    res.json({
      notifications,
      unreadCount
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
})

// PATCH /api/notifications/read-all – mark all notifications as read (MUST BE BEFORE /:id/read)
router.patch('/read-all', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId
    await Notification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() }
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications as read' })
  }
})

// PATCH /api/notifications/:id/read – mark notification as read
router.patch('/:id/read', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId
    const notification = await Notification.findById(req.params.id)
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' })
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    notification.read = true
    notification.readAt = new Date()
    await notification.save()

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' })
  }
})

// DELETE /api/notifications/:id – delete notification
router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId
    const notification = await Notification.findById(req.params.id)
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' })
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    await Notification.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification' })
  }
})

module.exports = router
