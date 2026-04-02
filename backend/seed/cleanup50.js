const mongoose = require('mongoose')
const Campaign = require('../models/Campaign')

// MongoDB connection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fundhope'

// Category to image mapping
const categoryImageMap = {
  'Medical': '/campaigns/hospital.jpg',
  'Health': '/campaigns/medical-camp.jpg',
  'Education': '/campaigns/school.jpg',
  'Environment': '/campaigns/environment.jpg',
  'Disaster Relief': '/campaigns/flood.jpg',
  'Community': '/campaigns/relief.jpg',
  'Other': '/campaigns/relief.jpg',
}

async function cleanupCampaigns() {
  try {
    console.log('🔄 Connecting to MongoDB...')
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✅ Connected to MongoDB')

    // Get all campaigns sorted by createdAt (newest first)
    console.log('\n📊 Fetching all campaigns...')
    const allCampaigns = await Campaign.find().sort({ createdAt: -1 })
    console.log(`Found ${allCampaigns.length} campaigns`)

    // Get the first 50 (newest)
    const campaignsToKeep = allCampaigns.slice(0, 50)
    const campaignsToDelete = allCampaigns.slice(50)

    console.log(`\n🔄 Processing 50 campaigns to keep...`)
    
    // Update campaigns to ensure they have images
    for (let campaign of campaignsToKeep) {
      if (!campaign.imageUrl) {
        const mappedImage = categoryImageMap[campaign.category] || '/campaigns/relief.jpg'
        campaign.imageUrl = mappedImage
        await campaign.save()
        console.log(`  ✅ Added image to: ${campaign.title}`)
      }
    }

    console.log(`\n🗑️  Deleting ${campaignsToDelete.length} old campaigns...`)
    const deleteResult = await Campaign.deleteMany({
      _id: { $in: campaignsToDelete.map(c => c._id) }
    })
    console.log(`✅ Deleted ${deleteResult.deletedCount} campaigns`)

    // Final verification
    console.log('\n📊 Final Database Status:')
    const finalCount = await Campaign.countDocuments()
    const withImages = await Campaign.countDocuments({ imageUrl: { $exists: true, $ne: null } })
    const totalRaised = await Campaign.aggregate([
      { $group: { _id: null, total: { $sum: '$currentAmount' } } }
    ])

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✅ Total Campaigns: ${finalCount}`)
    console.log(`📸 Campaigns with Images: ${withImages}/${finalCount}`)
    console.log(`💰 Total Raised: ₹${totalRaised[0]?.total || 0}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    if (finalCount === 50 && withImages === 50) {
      console.log('\n✅ CLEANUP COMPLETE - All 50 campaigns have images!')
    }

    process.exit(0)
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

cleanupCampaigns()
