// Seed script to create demo notifications for users and campaigns
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fundhope', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// Models
const User = require('../models/User')
const Campaign = require('../models/Campaign')
const Notification = require('../models/Notification')

// Notification templates
const notificationTemplates = [
  (userName, campaignTitle) => ({
    type: 'approved',
    title: '✅ Campaign Approved',
    message: `Great news! Your campaign "${campaignTitle}" has been approved and is now live!`,
  }),
  (userName, campaignTitle) => ({
    type: 'update',
    title: '📝 Campaign Updated',
    message: `Your campaign "${campaignTitle}" received a new donation or admin update!`,
  }),
  (userName, campaignTitle) => ({
    type: 'reminder',
    title: '⏰ Deadline Reminder',
    message: `Your campaign "${campaignTitle}" deadline is approaching! Keep promoting to reach your goal.`,
  }),
  (userName, campaignTitle) => ({
    type: 'reminder',
    title: '🎉 Milestone Reached',
    message: `Congratulations! "${campaignTitle}" has reached 50% of its funding goal!`,
  }),
  (userName, campaignTitle) => ({
    type: 'update',
    title: '💳 Donation Received',
    message: `Your campaign "${campaignTitle}" received a new donation. Thank you!`,
  }),
]

async function seedNotifications() {
  try {
    console.log('🔔 Starting notification seeding...\n')

    // Get demo users and campaigns
    const users = await User.find({ clerkId: { $regex: '^user_demo' } }).lean()
    const campaigns = await Campaign.find({}).lean()

    console.log(`📋 Found ${users.length} demo users and ${campaigns.length} campaigns\n`)

    let notificationsCreated = 0

    // Create notifications for each user
    for (const user of users) {
      // Each user gets 2-4 random notifications
      const notificationCount = Math.floor(Math.random() * 3) + 2

      for (let i = 0; i < notificationCount; i++) {
        const randomCampaign = campaigns[Math.floor(Math.random() * campaigns.length)]
        const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)]
        const notification = template(user.fullName, randomCampaign.title)

        const newNotification = new Notification({
          userId: user.clerkId,
          campaignId: randomCampaign._id,
          ...notification,
          read: Math.random() > 0.5, // 50% are already read
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        })

        await newNotification.save()
        notificationsCreated++
      }

      console.log(`  ✓ ${notificationCount} notifications for ${user.fullName}`)
    }

    console.log(`\n✅ Created ${notificationsCreated} notifications`)
    console.log(`📊 Average per user: ${(notificationsCreated / users.length).toFixed(1)}`)
    console.log('\n✨ Notification seeding completed!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding error:', error)
    process.exit(1)
  }
}

seedNotifications()
