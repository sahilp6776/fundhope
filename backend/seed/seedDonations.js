// Seed donations to database
console.log('🚀 Script starting...')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
console.log('📦 Modules loaded')

// Define models inline to avoid path issues
const donationSchema = new mongoose.Schema({}, { strict: false })
const campaignSchema = new mongoose.Schema({}, { strict: false })
const Campaign = mongoose.model('Campaign', campaignSchema, 'campaigns')
const Donation = mongoose.model('Donation', donationSchema, 'donations')

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fundhope'

async function seedDonations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')

    // Get all campaigns
    const campaigns = await Campaign.find({})
    if (campaigns.length === 0) {
      console.log('❌ No campaigns found. Please seed campaigns first.')
      process.exit(1)
    }

    console.log(`📊 Found ${campaigns.length} campaigns`)

    // Demo donation data (linked to real campaigns)
    const demoDonations = [
      {
        campaignId: campaigns[0]._id,
        userId: 'user_demo_001',
        amount: 5000,
        paymentId: 'pay_demo_001',
        orderId: 'order_demo_001',
        message: 'Great initiative! Keep up the good work 💪',
        status: 'completed'
      },
      {
        campaignId: campaigns[1]._id,
        userId: 'user_demo_002',
        amount: 2500,
        paymentId: 'pay_demo_002',
        orderId: 'order_demo_002',
        message: 'Hoping this helps make a difference ❤️',
        status: 'completed'
      },
      {
        campaignId: campaigns[0]._id,
        userId: 'user_demo_003',
        amount: 1000,
        paymentId: 'pay_demo_003',
        orderId: 'order_demo_003',
        message: 'Supporting your noble cause',
        status: 'completed'
      },
      {
        campaignId: campaigns[2]._id,
        userId: 'user_demo_004',
        amount: 7500,
        paymentId: 'pay_demo_004',
        orderId: 'order_demo_004',
        message: 'Every bit counts! 🌟',
        status: 'completed'
      },
      {
        campaignId: campaigns[1]._id,
        userId: 'user_demo_005',
        amount: 3000,
        paymentId: 'pay_demo_005',
        orderId: 'order_demo_005',
        message: 'Proud to contribute to this cause',
        status: 'completed'
      },
      {
        campaignId: campaigns[3]._id,
        userId: 'user_demo_006',
        amount: 4500,
        paymentId: 'pay_demo_006',
        orderId: 'order_demo_006',
        message: 'Stay strong! We are with you 💝',
        status: 'completed'
      },
      {
        campaignId: campaigns[0]._id,
        userId: 'user_demo_007',
        amount: 2000,
        paymentId: 'pay_demo_007',
        orderId: 'order_demo_007',
        message: 'This is important work',
        status: 'completed'
      },
      {
        campaignId: campaigns[4]._id,
        userId: 'user_demo_008',
        amount: 6000,
        paymentId: 'pay_demo_008',
        orderId: 'order_demo_008',
        message: 'Together we can make it happen! 🚀',
        status: 'completed'
      },
    ]

    // Clear existing donations (optional - comment out if you want to keep existing)
    // const deletedCount = await Donation.deleteMany({})
    // console.log(`🗑️  Deleted ${deletedCount.deletedCount} existing donations`)

    // Insert new donations
    const result = await Donation.insertMany(demoDonations)
    console.log(`✅ Successfully inserted ${result.length} demo donations`)

    // Show sample data
    console.log('\n📋 Sample Donations:')
    result.slice(0, 3).forEach((donation, idx) => {
      const campaign = campaigns.find(c => c._id.toString() === donation.campaignId.toString())
      console.log(`  ${idx + 1}. ₹${donation.amount} → "${campaign?.title}" (${donation.message})`)
    })

    // Get donation counts
    const totalDonations = await Donation.countDocuments()
    const totalRaised = await Donation.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    console.log(`\n💰 Total Donations: ${totalDonations}`)
    console.log(`💵 Total Raised: ₹${totalRaised[0]?.total || 0}`)
    console.log(`\n✅ Seeding complete!`)

    process.exit(0)
  } catch (err) {
    console.error('❌ Error seeding donations:')
    console.error('Error message:', err.message)
    console.error('Error stack:', err.stack)
    process.exit(1)
  }
}

seedDonations()
