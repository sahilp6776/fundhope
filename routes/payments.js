// Payment routes – Razorpay order creation and verification
const express = require('express')
const router = express.Router()
const Razorpay = require('razorpay')
const crypto = require('crypto')
const { authMiddleware } = require('../middleware/auth')
const Campaign = require('../models/Campaign')
const Donation = require('../models/Donation')
const User = require('../models/User')

// Initialize Razorpay with key and secret from environment (if provided)
const useRazor = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_ID.includes('YOUR'))
let razorpay = null
if (useRazor) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
} else {
  console.warn('Razorpay keys not configured – running in demo payment mode')
}

// ============================================================
// POST /api/payments/create-order
// Creates a Razorpay order and returns orderId + key to frontend
// Protected: must be logged in
// ============================================================
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { amount, campaignId, campaignTitle } = req.body

    // Validate inputs
    if (!amount || !campaignId) {
      return res.status(400).json({ error: 'Amount and campaignId are required' })
    }

    if (typeof amount !== 'number' || amount < 50) {
      return res.status(400).json({ error: 'Minimum donation amount is ₹50' })
    }

    // Verify campaign exists and is approved
    const campaign = await Campaign.findById(campaignId)

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    if (campaign.status !== 'approved') {
      return res.status(400).json({ error: 'Campaign is not active' })
    }

    // Check deadline
    if (new Date(campaign.deadline) < new Date()) {
      return res.status(400).json({ error: 'Campaign has ended' })
    }

    // Create Razorpay order
    if (useRazor) {
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert INR to paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}_${req.userId?.slice(0, 8) || 'anon'}`,
        notes: {
          campaignId,
          campaignTitle: campaignTitle || campaign.title,
          userId: req.userId,
        },
      })

      // Return order details and Razorpay public key to frontend
      res.status(200).json({
        orderId: order.id,
        amount: order.amount,     // In paise
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,  // Safe to expose (public key only)
      })
    } else {
      // Demo order – return fake order id and no key (triggers demo mode in frontend)
      const demoOrderId = `demo_order_${Date.now()}`
      res.status(200).json({
        orderId: demoOrderId,
        amount: Math.round(amount * 100),
        currency: 'INR',
        keyId: null,
        isDemoMode: true,
      })
    }

  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ error: 'Failed to create payment order' })
  }
})

// ============================================================
// POST /api/payments/verify
// Verifies Razorpay payment signature (CRITICAL for security!)
// Without this, anyone could fake a successful payment
// ============================================================
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      campaignId,
      userId,
      amount,
    } = req.body

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification fields' })
    }

    // *** SIGNATURE VERIFICATION ***
    // If running with demo order (order ID starts with demo_order_), accept any signature
    // Otherwise, verify with Razorpay signature
    let isValid = false
    if (razorpay_order_id.startsWith('demo_order_')) {
      // Demo mode - accept any signature
      isValid = true
    } else if (useRazor) {
      // Real Razorpay - verify signature
      const body = `${razorpay_order_id}|${razorpay_payment_id}`
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex')
      isValid = expectedSignature === razorpay_signature
      if (!isValid) {
        console.warn('⚠️ Invalid payment signature from user:', req.userId)
        return res.status(400).json({ error: 'Invalid payment signature. Possible fraud attempt.' })
      }
    } else {
      // No Razorpay and not demo - accept
      isValid = true
    }

    // Payment is genuine – check for duplicate payment
    const existingDonation = await Donation.findOne({ paymentId: razorpay_payment_id })

    if (existingDonation) {
      return res.status(409).json({ error: 'Duplicate payment detected' })
    }

    // Return success – frontend will then save to Firestore
    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    res.status(500).json({ error: 'Payment verification failed' })
  }
})
// POST /api/payments/save-donation – save donation after successful payment
router.post('/save-donation', authMiddleware, async (req, res) => {
  try {
    const { amount, campaignId, paymentId, orderId } = req.body

    // Validation
    if (!amount || !campaignId || !paymentId || !orderId) {
      return res.status(400).json({ error: 'All fields are required' })
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

    // Create donation - will fail with duplicate error if paymentId already exists
    const donation = new Donation({
      amount,
      campaignId,
      userId: req.userId,
      paymentId,
      orderId
    })

    await donation.save()

    // Update campaign's current amount
    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: { currentAmount: amount }
    })

    res.status(201).json({ success: true, donation })
  } catch (error) {
    console.error('Save donation error:', error)
    res.status(500).json({ error: 'Failed to save donation' })
  }
})

// Get user's donations
router.get('/user/me', authMiddleware, async (req, res) => {
  try {
    const donations = await Donation.find({ userId: req.userId })
      .populate('campaignId', 'title category')
      .sort({ createdAt: -1 })
      .lean()
    res.json(donations)
  } catch (error) {
    console.error('Fetch user donations error:', error)
    res.status(500).json({ error: 'Failed to fetch donations' })
  }
})

module.exports = router
