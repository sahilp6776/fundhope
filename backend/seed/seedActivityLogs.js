// Seed script to create demo activity logs
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fundhope', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// Models
const Campaign = require('../models/Campaign')
const User = require('../models/User')
const ActivityLog = require('../models/ActivityLog')

// Activity log templates
const activityTemplates = (campaign, userName) => [
  {
    action: 'created',
    comments: `Campaign created by creator`,
    previousStatus: null,
    newStatus: 'pending',
  },
  {
    action: 'approved',
    comments: `Campaign approved and made live for donations`,
    previousStatus: 'pending',
    newStatus: 'approved',
  },
  {
    action: 'updated',
    comments: `Campaign details updated`,
    previousStatus: campaign.status,
    newStatus: campaign.status,
  },
  {
    action: 'approved',
    comments: `Approved after review and verification`,
    previousStatus: 'pending',
    newStatus: 'approved',
  },
]

async function seedActivityLogs() {
  try {
    console.log('📝 Starting activity log seeding...\n')

    // Get campaigns and demo users
    const campaigns = await Campaign.find({}).lean()
    const users = await User.find({ clerkId: { $regex: '^user_demo' } }).lean()

    console.log(`📋 Found ${campaigns.length} campaigns and ${users.length} demo users\n`)

    let logsCreated = 0

    // Create activity logs for each campaign
    for (const campaign of campaigns) {
      // Each campaign gets 3-5 activity logs
      const logCount = Math.floor(Math.random() * 3) + 3

      for (let i = 0; i < logCount; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)]
        const templates = activityTemplates(campaign, randomUser.fullName)
        const template = templates[Math.floor(Math.random() * templates.length)]

        const activityLog = new ActivityLog({
          campaignId: campaign._id,
          campaignTitle: campaign.title,
          performedBy: campaign.createdBy || randomUser.clerkId,
          performedByName: randomUser.fullName,
          ...template,
          createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        })

        await activityLog.save()
        logsCreated++
      }

      console.log(`  ✓ ${logCount} activity logs for "${campaign.title}"`)
    }

    console.log(`\n✅ Created ${logsCreated} activity logs`)
    console.log(`📊 Average per campaign: ${(logsCreated / campaigns.length).toFixed(1)}`)
    console.log('\n✨ Activity log seeding completed!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding error:', error)
    process.exit(1)
  }
}

seedActivityLogs()
