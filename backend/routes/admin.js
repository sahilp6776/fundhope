// Admin API routes – protected admin-only endpoints
const express = require('express')
const router = express.Router()

// ✅ FIXED
const authMiddleware = require('../middleware/auth')
const Campaign = require('../models/Campaign')
const Donation = require('../models/Donation')
const ActivityLog = require('../models/ActivityLog')
const Notification = require('../models/Notification')
const User = require('../models/User')

// ===== PUBLIC READ ENDPOINTS (no auth required) =====

// GET /api/admin/stats – platform statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalCampaigns, totalDonations, totalPending] = await Promise.all([
      Campaign.countDocuments(),
      Donation.countDocuments(),
      Campaign.countDocuments({ status: 'pending' })
    ])

    // Get total raised amount only
    const donations = await Donation.find({}, { amount: 1 }).lean()
    const totalRaised = donations.reduce((sum, d) => sum + (d.amount || 0), 0)

    res.json({
      totalCampaigns,
      totalDonations,
      pendingApproval: totalPending,
      totalRaised,
    })
  } catch (err) {
    console.error('Stats endpoint error:', err.message)
    res.status(500).json({ error: 'Failed to fetch stats', message: err.message })
  }
})

// GET /api/admin/campaigns – all campaigns for admin view
router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await Campaign.find({}).sort({ createdAt: -1 })
    res.json(campaigns)
  } catch (err) {
    console.error('Campaigns endpoint error:', err.message)
    res.status(500).json({ error: 'Failed to fetch campaigns', message: err.message })
  }
})

// GET /api/admin/donations – all donations for admin view
router.get('/donations', async (req, res) => {
  try {
    // Get all donations without populate to avoid ObjectId casting errors
    const donations = await Donation.find({})
      .sort({ createdAt: -1 })
      .lean()
    
    // If no donations, return empty array
    if (!donations || donations.length === 0) {
      return res.json([])
    }
    
    // Get all campaigns for lookup
    const campaigns = await Campaign.find({}, { _id: 1, title: 1, category: 1 }).lean()
    const campaignMap = {}
    campaigns.forEach(c => {
      campaignMap[c._id.toString()] = c
    })
    
    // Enhance donations with campaign data
    const enrichedDonations = donations.map(d => ({
      ...d,
      campaignId: campaignMap[d.campaignId?.toString()] || { title: 'Unknown Campaign', category: 'Unknown' }
    }))
    
    res.json(enrichedDonations)
  } catch (err) {
    console.error('Donations endpoint error:', err.message)
    res.status(500).json({ error: 'Failed to fetch donations', message: err.message })
  }
})

// GET /api/admin/users – get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    console.error('Users endpoint error:', err.message)
    res.status(500).json({ error: 'Failed to fetch users', message: err.message })
  }
})

// GET /api/admin/activity – activity log for all campaigns
router.get('/activity', async (req, res) => {
  try {
    const activities = await ActivityLog.find({})
      .sort({ createdAt: -1 })
      .limit(100)
    res.json(activities)
  } catch (err) {
    console.error('Activity endpoint error:', err.message)
    res.status(500).json({ error: 'Failed to fetch campaign activity', message: err.message })
  }
})

// GET /api/admin/users/:id/donations – get specific user's donation history
router.get('/users/:id/donations', async (req, res) => {
  try {
    const donations = await Donation.find({ userId: req.params.id })
      .populate('campaignId', 'title category')
      .sort({ createdAt: -1 })
    res.json(donations)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user donations' })
  }
})

// GET /api/admin/campaign/:id/activity – activity log for specific campaign
router.get('/campaign/:id/activity', async (req, res) => {
  try {
    const activities = await ActivityLog.find({ campaignId: req.params.id })
      .sort({ createdAt: -1 })
    res.json(activities)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campaign activity' })
  }
})

// GET /api/admin/analytics – comprehensive platform analytics
router.get('/analytics', async (req, res) => {
  try {
    // Count total documents
    const totalCampaigns = await Campaign.countDocuments()
    const totalDonations = await Donation.countDocuments()
    const totalUsers = await User.countDocuments()

    // Calculate total raised amount using aggregation
    const totalRaisedResult = await Donation.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ])
    const totalRaised = totalRaisedResult[0]?.total || 0

    // Count campaigns by status
    const campaignsByStatus = await Campaign.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])
    const statusMap = {}
    campaignsByStatus.forEach((item) => {
      statusMap[item._id] = item.count
    })

    // Calculate average donation amount
    const avgDonationResult = await Donation.aggregate([
      {
        $group: {
          _id: null,
          average: { $avg: '$amount' }
        }
      }
    ])
    const avgDonation = avgDonationResult[0]?.average || 0

    res.json({
      totalCampaigns,
      totalDonations,
      totalUsers,
      totalRaised,
      avgDonation: Math.round(avgDonation),
      campaignsByStatus: {
        approved: statusMap.approved || 0,
        pending: statusMap.pending || 0,
        rejected: statusMap.rejected || 0
      }
    })
  } catch (err) {
    console.error('Analytics error:', err)
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
})

// ===== PROTECTED WRITE ENDPOINTS (require admin auth) =====
// All routes below require auth and admin role
router.use(authMiddleware)

// PATCH /api/admin/campaigns/:id/status – approve or reject with comments
router.patch('/campaigns/:id/status', async (req, res) => {
  try {
    const { status, comments } = req.body
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    // Get the campaign to check current status
    const campaign = await Campaign.findById(req.params.id)
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    const previousStatus = campaign.status
    const adminName = req.userName || 'Admin' // Get admin name from auth middleware

    // Update campaign with approval info
    const updateData = {
      status,
      updatedAt: new Date()
    }

    if (status === 'approved') {
      updateData.approvedBy = req.userId
      updateData.approvedByName = adminName
      updateData.approvedAt = new Date()
      if (comments) updateData.approvalNotes = comments
    } else if (status === 'rejected') {
      if (comments) updateData.rejectionReason = comments
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(req.params.id, updateData, { new: true })

    // Log the activity
    await ActivityLog.create({
      campaignId: campaign._id,
      campaignTitle: campaign.title,
      action: status === 'approved' ? 'approved' : 'rejected',
      performedBy: req.userId,
      performedByName: adminName,
      comments: comments || null,
      previousStatus,
      newStatus: status
    })

    // Send notification to campaign creator
    const notificationTitle = status === 'approved' 
      ? '✅ Your Campaign Was Approved!' 
      : '❌ Your Campaign Was Rejected'
    
    const notificationMessage = status === 'approved'
      ? `Great news! Your campaign "${campaign.title}" has been approved and is now live. Donations can now be made!${comments ? ` Admin notes: ${comments}` : ''}`
      : `Your campaign "${campaign.title}" was not approved.${comments ? ` Reason: ${comments}` : ''}`

    const notification = await Notification.create({
      userId: campaign.createdBy,
      campaignId: campaign._id,
      type: status === 'approved' ? 'approved' : 'rejected',
      title: notificationTitle,
      message: notificationMessage
    })

    // Emit real-time notification via WebSocket
    const io = req.app.locals.io
    if (io) {
      io.to(`user:${campaign.createdBy}`).emit('notification', {
        _id: notification._id,
        title: notificationTitle,
        message: notificationMessage,
        type: notification.type,
        read: false,
        createdAt: notification.createdAt
      })
    }

    res.json({ 
      success: true, 
      status,
      message: `Campaign ${status} successfully`,
      campaign: updatedCampaign
    })
  } catch (err) {
    console.error('Error updating campaign status:', err)
    res.status(500).json({ error: 'Failed to update campaign status' })
  }
})

// DELETE /api/admin/campaigns/:id – delete inappropriate campaign
router.delete('/campaigns/:id', async (req, res) => {
  try {
    await Campaign.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete campaign' })
  }
})

// PATCH /api/admin/users/:id/suspend – suspend or unsuspend user
router.patch('/users/:id/suspend', async (req, res) => {
  try {
    const { isSuspended, reason } = req.body
    
    const updateData = {
      isSuspended,
      suspensionReason: reason || null,
      suspendedBy: req.userId,
    }
    
    if (isSuspended) {
      updateData.suspendedAt = new Date()
    } else {
      updateData.suspendedAt = null
      updateData.suspensionReason = null
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ 
      success: true,
      message: isSuspended ? 'User suspended successfully' : 'User unsuspended successfully',
      user
    })
  } catch (err) {
    console.error('Error updating user suspension:', err)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

module.exports = router
