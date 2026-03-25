const mongoose = require('mongoose')
const Campaign = require('../models/Campaign')

// MongoDB connection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fundhope'

// Category to image mapping - proper paths
const categoryImageMap = {
  'Medical': '/campaigns/hospital.jpg',
  'Health': '/campaigns/medical-camp.jpg',
  'Education': '/campaigns/school.jpg',
  'Environment': '/campaigns/environment.jpg',
  'Disaster Relief': '/campaigns/flood.jpg',
  'Community': '/campaigns/relief.jpg',
  'Other': '/campaigns/relief.jpg',
}

// Fallback image pool for variety
const imageFallback = [
  '/campaigns/hospital.jpg',
  '/campaigns/medical-camp.jpg',
  '/campaigns/ambulance.jpg',
  '/campaigns/school.jpg',
  '/campaigns/water-project.jpg',
  '/campaigns/farmers.jpg',
  '/campaigns/flood.jpg',
  '/campaigns/cyclone.jpg',
  '/campaigns/disaster.jpg',
  '/campaigns/environment.jpg',
  '/campaigns/solar.jpg',
  '/campaigns/animal.jpg',
  '/campaigns/women-training.jpg',
  '/campaigns/food.jpg',
  '/campaigns/relief.jpg',
]

async function fixCampaignImages() {
  try {
    console.log('🔄 Connecting to MongoDB...')
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✅ Connected to MongoDB')

    console.log('\n📸 Fixing campaign images...')
    const campaigns = await Campaign.find()
    
    let updated = 0
    for (let i = 0; i < campaigns.length; i++) {
      const campaign = campaigns[i]
      const category = campaign.category || 'Other'
      
      // Get image based on category, or rotate through fallback
      let imageUrl = categoryImageMap[category]
      if (!imageUrl) {
        imageUrl = imageFallback[i % imageFallback.length]
      }

      // Only update if image URL is incorrect
      if (campaign.imageUrl !== imageUrl && !campaign.imageUrl?.startsWith('/campaigns/')) {
        campaign.imageUrl = imageUrl
        await campaign.save()
        updated++
        console.log(`  ✅ ${campaign.title} → ${imageUrl}`)
      }
    }

    console.log(`\n📊 Update Summary:`)
    console.log(`  Total Campaigns: ${campaigns.length}`)
    console.log(`  Updated Images: ${updated}`)

    // Verify all have proper images
    const withProperImages = await Campaign.countDocuments({
      imageUrl: { $regex: '^/campaigns/' }
    })
    
    console.log(`\n✅ VERIFICATION:`)
    console.log(`  Campaigns with /campaigns/ path: ${withProperImages}/${campaigns.length}`)

    if (withProperImages === campaigns.length) {
      console.log('\n🎉 SUCCESS - All campaigns have proper image URLs!')
    }

    process.exit(0)
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

fixCampaignImages()
