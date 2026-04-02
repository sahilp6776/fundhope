const express = require('express')
const router = express.Router()
const Razorpay = require('razorpay')
const crypto = require('crypto')

// ❌ REMOVED authMiddleware
// const { authMiddleware } = require('../middleware/auth')

const Campaign = require('../models/Campaign')
const Donation = require('../models/Donation')
const User = require('../models/User')

// Razorpay setup
const useRazor = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
let razorpay = null

if (useRazor) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
} else {
  console.warn('Running in demo payment mode')
}

// ================= CREATE ORDER =================
router.post('/create-order', async (req, res) => {
  try {
    const { amount, campaignId } = req.body

    if (!amount || !campaignId) {
      return res.status(400).json({ error: 'Amount and campaignId required' })
    }

    const campaign = await Campaign.findById(campaignId)
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    if (useRazor) {
      const order = await razorpay.orders.create({
        amount: amount * 100,
        currency: 'INR'
      })

      res.json({
        orderId: order.id,
        amount: order.amount,
        keyId: process.env.RAZORPAY_KEY_ID
      })
    } else {
      res.json({
        orderId: "demo_order_" + Date.now(),
        amount: amount * 100,
        isDemo: true
      })
    }

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// ================= VERIFY =================
router.post('/verify', async (req, res) => {
  try {
    res.json({ success: true, message: "Payment verified (demo)" })
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' })
  }
})

// ================= SAVE DONATION =================
router.post('/save-donation', async (req, res) => {
  try {
    const { amount, campaignId } = req.body

    const donation = new Donation({
      amount,
      campaignId,
      paymentId: "demo_payment"
    })

    await donation.save()

    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: { currentAmount: amount }
    })

    res.json({ success: true })

  } catch (err) {
    res.status(500).json({ error: 'Save failed' })
  }
})

// ================= GET DONATIONS =================
router.get('/user/me', async (req, res) => {
  try {
    const donations = await Donation.find()
    res.json(donations)
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed' })
  }
})

module.exports = router
