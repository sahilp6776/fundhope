// Seed script to create demo users and donations in database
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fundhope', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// Models
const Campaign = require('../models/Campaign')
const User = require('../models/User')
const Donation = require('../models/Donation')

// Demo user data - 25 realistic Indian users
const demoUsers = [
  {
    clerkId: 'user_demo_001',
    email: 'rajesh.sharma@example.com',
    fullName: 'Rajesh Sharma',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_002',
    email: 'priya.patel@example.com',
    fullName: 'Priya Patel',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_003',
    email: 'amit.desai@example.com',
    fullName: 'Amit Desai',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_004',
    email: 'neha.singh@example.com',
    fullName: 'Neha Singh',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_005',
    email: 'vikram.pillai@example.com',
    fullName: 'Vikram Pillai',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_006',
    email: 'deepak.gupta@example.com',
    fullName: 'Deepak Gupta',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_007',
    email: 'anjali.sharma@example.com',
    fullName: 'Anjali Sharma',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_008',
    email: 'sidharth.nair@example.com',
    fullName: 'Sidharth Nair',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_009',
    email: 'meera.verma@example.com',
    fullName: 'Meera Verma',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_010',
    email: 'rohan.kumar@example.com',
    fullName: 'Rohan Kumar',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_011',
    email: 'kavya.menon@example.com',
    fullName: 'Kavya Menon',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_012',
    email: 'suresh.iyer@example.com',
    fullName: 'Suresh Iyer',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_013',
    email: 'mamta.khanna@example.com',
    fullName: 'Mamta Khanna',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_014',
    email: 'vishal.reddy@example.com',
    fullName: 'Vishal Reddy',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_015',
    email: 'sneha.roy@example.com',
    fullName: 'Sneha Roy',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_016',
    email: 'arjun.pan@example.com',
    fullName: 'Arjun Pan',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_017',
    email: 'ravi.kumar.sen@example.com',
    fullName: 'Ravi Kumar',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_018',
    email: 'aisha.khan@example.com',
    fullName: 'Aisha Khan',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_019',
    email: 'bhavana.thakur@example.com',
    fullName: 'Bhavana Thakur',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_020',
    email: 'harsh.jain@example.com',
    fullName: 'Harsh Jain',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_021',
    email: 'divya.bhat@example.com',
    fullName: 'Divya Bhat',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_022',
    email: 'sanjay.kapoor@example.com',
    fullName: 'Sanjay Kapoor',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_023',
    email: 'nisha.yadav@example.com',
    fullName: 'Nisha Yadav',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_024',
    email: 'rahul.das@example.com',
    fullName: 'Rahul Das',
    lastLogin: new Date(),
  },
  {
    clerkId: 'user_demo_025',
    email: 'pooja.srivastav@example.com',
    fullName: 'Pooja Srivastava',
    lastLogin: new Date(),
  },
]

// Function to generate random donation amounts with varied distribution
const randomAmount = () => {
  // More realistic distribution: weighted towards smaller donations
  const rand = Math.random()
  
  if (rand < 0.4) {
    // 40% small donations: ₹100 - ₹1000
    return Math.floor(Math.random() * 900) + 100
  } else if (rand < 0.7) {
    // 30% medium donations: ₹1000 - ₹5000
    return Math.floor(Math.random() * 4000) + 1000
  } else if (rand < 0.9) {
    // 20% larger donations: ₹5000 - ₹25000
    return Math.floor(Math.random() * 20000) + 5000
  } else {
    // 10% major donations: ₹25000 - ₹100000
    return Math.floor(Math.random() * 75000) + 25000
  }
}

// Main seeding function
async function seedData() {
  try {
    console.log('🌱 Starting demo data seeding...\n')

    // 1. Create/Update Users
    console.log('👥 Creating demo users...')
    const createdUsers = []
    for (const userData of demoUsers) {
      const user = await User.findOneAndUpdate(
        { clerkId: userData.clerkId },
        userData,
        { upsert: true, new: true }
      )
      createdUsers.push(user)
    }
    console.log(`✅ Created/Updated ${createdUsers.length} demo users\n`)

    // 2. Get all campaigns
    console.log('📋 Fetching campaigns...')
    const campaigns = await Campaign.find({})
    console.log(`✅ Found ${campaigns.length} campaigns\n`)

    if (campaigns.length === 0) {
      console.warn('⚠️  No campaigns found. Run seed/seedComplete.js first.')
      process.exit(1)
    }

    // 3. Generate donations for each campaign
    console.log('💳 Creating demo donations...')
    let totalDonationsCreated = 0
    let totalAmountDonated = 0

    for (const campaign of campaigns) {
      // Each campaign gets 4-8 random donations from random users
      const donationCount = Math.floor(Math.random() * 5) + 4

      for (let i = 0; i < donationCount; i++) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)]
        const amount = randomAmount()
        
        // Create donation
        const donation = new Donation({
          amount,
          campaignId: campaign._id,
          userId: randomUser.clerkId,
          paymentId: `demo_pay_${Date.now()}_${i}`,
          orderId: `demo_order_${Date.now()}_${i}`,
          status: 'completed',
          createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Random date in last 60 days
        })

        await donation.save()
        totalDonationsCreated++
        totalAmountDonated += amount
      }

      console.log(`  ✓ ${donationCount} donations for "${campaign.title}"`)
    }

    console.log(`\n✅ Created ${totalDonationsCreated} demo donations`)
    console.log(`💰 Total amount donated: ₹${totalAmountDonated.toLocaleString('en-IN')}\n`)

    // 4. Display summary
    console.log('📊 SEEDING SUMMARY')
    console.log('═'.repeat(50))
    console.log(`✅ Users created/updated: ${createdUsers.length}`)
    console.log(`✅ Campaigns processed: ${campaigns.length}`)
    console.log(`✅ Donations created: ${totalDonationsCreated}`)
    console.log(`💰 Total donated: ₹${totalAmountDonated.toLocaleString('en-IN')}`)
    console.log('═'.repeat(50))
    console.log('\n📈 Sample Users:')
    demoUsers.slice(0, 5).forEach((u) => {
      console.log(`   • ${u.fullName} (${u.email})`)
    })

    console.log('\n✨ Demo data seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding error:', error)
    process.exit(1)
  }
}

// Run seeding
seedData()
