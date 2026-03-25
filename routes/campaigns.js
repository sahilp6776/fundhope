// Campaign API routes – backend support for campaigns
const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth')
const Campaign = require('../models/Campaign')
const Donation = require('../models/Donation')
const User = require('../models/User')
const { CAMPAIGN_STATUSES, CAMPAIGN_CATEGORIES, VALIDATION_RULES, sanitizeInput, sanitizeCampaignData } = require('../utils/constants')

// GET /api/campaigns – get all approved campaigns (public)
router.get('/', async (req, res) => {
  try {
    const { category, limit = 1000, skip = 0 } = req.query
    let query = { status: 'approved' }

    if (category && category !== 'All') {
      query.category = category
    }

    const campaigns = await Campaign.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
    res.json(campaigns)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch campaigns' })
  }
})

// GET /api/campaigns/user/me – get current user's campaigns (must come BEFORE /:id)
router.get('/user/me', authMiddleware, async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query
    const campaigns = await Campaign.find({ createdBy: req.userId })
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
    res.json(campaigns)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campaigns' })
  }
})

// GET /api/campaigns/:id – get single campaign (must come AFTER /user/me)
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' })
    res.json(campaign)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campaign' })
  }
})

// POST /api/campaigns – create new campaign
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, goalAmount, deadline, imageUrl } = req.body

    // Validation
    if (!title || !description || !category || !goalAmount || !deadline) {
      return res.status(400).json({ error: 'All required fields must be provided' })
    }

    // Validate category
    if (!CAMPAIGN_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid campaign category' })
    }

    if (goalAmount < 100) {
      return res.status(400).json({ error: 'Goal amount must be at least ₹100' })
    }

    if (new Date(deadline) <= new Date()) {
      return res.status(400).json({ error: 'Deadline must be in the future' })
    }

    // Sanitize inputs to prevent XSS
    const sanitized = sanitizeCampaignData({ title, description, category, goalAmount, deadline, imageUrl })

    // Validate image size if base64
    if (sanitized.imageUrl && sanitized.imageUrl.startsWith('data:')) {
      const base64Data = sanitized.imageUrl.split(',')[1] || sanitized.imageUrl
      const actualSizeKB = (base64Data.length * 0.75) / 1024
      const maxSizeKB = 2 * 1024

      if (actualSizeKB > maxSizeKB) {
        return res.status(400).json({ error: `Image exceeds 2MB limit (actual size: ${Math.round(actualSizeKB / 1024 * 10) / 10}MB)` })
      }
    }

    // Create or update user record
    await User.findOneAndUpdate(
      { clerkId: req.userId },
      {
        clerkId: req.userId,
        email: req.userEmail || 'unknown@example.com',
        fullName: req.userName || 'User',
        lastLogin: new Date()
      },
      { upsert: true, new: true }
    )

    // Get creator name from request header (Clerk sends this)
    const creatorName = req.headers['x-creator-name'] || req.headers['x-user-name'] || 'Creator'

    const campaign = new Campaign({
      title,
      description,
      category,
      goalAmount,
      deadline,
      imageUrl,
      createdBy: req.userId,
      creatorName,
      status: 'pending'  // ← All campaigns start as pending and require admin approval
    })

    await campaign.save()
    res.status(201).json(campaign)
  } catch (err) {
    console.error(err)
    if (err.message.includes('exceeds') || err.message.includes('16777216')) {
      return res.status(400).json({ error: 'Campaign data is too large. Please use a smaller image.' })
    }
    res.status(500).json({ error: 'Failed to create campaign' })
  }
})

// PATCH /api/campaigns/:id – update campaign
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, goalAmount, deadline, imageUrl } = req.body

    // Fetch campaign and check ownership
    const campaign = await Campaign.findById(req.params.id)
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    // campaign.createdBy is a Mongoose ObjectId – compare as string to avoid mismatch
    if (campaign.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only campaign creator can edit' })
    }

    // Validate image size if base64
    if (imageUrl && imageUrl.startsWith('data:')) {
      // Base64 strings are ~33% larger than actual binary
      const base64Data = imageUrl.split(',')[1] || imageUrl
      // 0.75 = inverse of base64 expansion
      const actualSizeKB = (base64Data.length * 0.75) / 1024
      const maxSizeKB = 2 * 1024  // 2MB limit
      
      if (actualSizeKB > maxSizeKB) {
        return res.status(400).json({ error: `Image exceeds 2MB limit (actual size: ${Math.round(actualSizeKB / 1024 * 10) / 10}MB)` })
      }
    }

    // Sanitize and validate inputs
    if (title) {
      const sanitizedTitle = sanitizeInput(title)
      if (sanitizedTitle.length < 5) {
        return res.status(400).json({ error: 'Title must be at least 5 characters' })
      }
      campaign.title = sanitizedTitle
    }

    if (description) {
      campaign.description = sanitizeInput(description)
    }

    if (category) {
      if (!CAMPAIGN_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: 'Invalid campaign category' })
      }
      campaign.category = category
    }

    if (goalAmount) {
      if (goalAmount < VALIDATION_RULES.CAMPAIGN_GOAL_MIN) {
        return res.status(400).json({ error: `Goal amount must be at least ₹${VALIDATION_RULES.CAMPAIGN_GOAL_MIN}` })
      }
      campaign.goalAmount = goalAmount
    }

    if (deadline) {
      if (new Date(deadline) <= new Date()) {
        return res.status(400).json({ error: 'Deadline must be in the future' })
      }
      campaign.deadline = deadline
    }

    if (imageUrl) campaign.imageUrl = imageUrl

    await campaign.save()
    res.json(campaign)
  } catch (err) {
    console.error(err)
    if (err.message.includes('exceeds') || err.message.includes('16777216')) {
      return res.status(400).json({ error: 'Campaign data is too large. Please use a smaller image.' })
    }
    res.status(500).json({ error: 'Failed to update campaign' })
  }
})

// DELETE /api/campaigns/:id – delete campaign
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    // Check if user is creator or admin
    // allow admin or creator; stringify ObjectId for comparison
    if (campaign.createdBy.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to delete this campaign' })
    }

    // Cascade delete: also delete associated donations
    const deletedDonations = await Donation.deleteMany({ campaignId: req.params.id })

    // Delete the campaign
    await Campaign.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Campaign deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete campaign' })
  }
})

module.exports = router
