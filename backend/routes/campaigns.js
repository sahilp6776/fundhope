const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth')
const Campaign = require('../models/Campaign')
const Donation = require('../models/Donation')
const User = require('../models/User')
const { CAMPAIGN_CATEGORIES, VALIDATION_RULES, sanitizeInput, sanitizeCampaignData } = require('../utils/constants')


// ✅ GET ALL CAMPAIGNS (PUBLIC)
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


// ✅ GET USER CAMPAIGNS (FIXED ROUTE)
router.get('/user/me', authMiddleware, async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query

    const campaigns = await Campaign.find({ createdBy: req.userId })
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))

    res.json(campaigns)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch user campaigns' })
  }
})


// ✅ GET SINGLE CAMPAIGN
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    res.json(campaign)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch campaign' })
  }
})


// ✅ CREATE CAMPAIGN
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, goalAmount, deadline, imageUrl } = req.body

    if (!title || !description || !category || !goalAmount || !deadline) {
      return res.status(400).json({ error: 'All required fields must be provided' })
    }

    if (!CAMPAIGN_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid campaign category' })
    }

    if (goalAmount < 100) {
      return res.status(400).json({ error: 'Goal amount must be at least ₹100' })
    }

    if (new Date(deadline) <= new Date()) {
      return res.status(400).json({ error: 'Deadline must be in the future' })
    }

    const sanitized = sanitizeCampaignData({ title, description, category, goalAmount, deadline, imageUrl })

    // Save user
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

    const campaign = new Campaign({
      ...sanitized,
      createdBy: req.userId,
      creatorName: req.headers['x-user-name'] || 'Creator',
      status: 'pending'
    })

    await campaign.save()
    res.status(201).json(campaign)

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create campaign' })
  }
})


// ✅ UPDATE CAMPAIGN
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    if (campaign.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only creator can edit' })
    }

    Object.assign(campaign, req.body)

    await campaign.save()
    res.json(campaign)

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update campaign' })
  }
})


// ✅ DELETE CAMPAIGN
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    if (campaign.createdBy.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'No permission' })
    }

    await Donation.deleteMany({ campaignId: req.params.id })
    await Campaign.findByIdAndDelete(req.params.id)

    res.json({ success: true })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete campaign' })
  }
})

module.exports = router
