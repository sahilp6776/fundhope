const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

// Import models
const Campaign = require('../models/Campaign')
const Donation = require('../models/Donation')

// MongoDB connection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fundhope'

// Category to image mapping
const categoryImageMap = {
  'Medical': '/campaigns/hospital.jpg',
  'Health': '/campaigns/medical-camp.jpg',
  'Education': '/campaigns/school.jpg',
  'Water': '/campaigns/water-project.jpg',
  'Agriculture': '/campaigns/farmers.jpg',
  'Disaster Relief': '/campaigns/flood.jpg',
  'Environment': '/campaigns/environment.jpg',
  'Food': '/campaigns/food.jpg',
  'Emergency': '/campaigns/ambulance.jpg',
  'Community': '/campaigns/relief.jpg',
  'Animal Welfare': '/campaigns/animal.jpg',
  'Energy': '/campaigns/solar.jpg',
  'Women Empowerment': '/campaigns/women-training.jpg',
  'General': '/campaigns/relief.jpg',
}

// Map incoming categories to allowed enum values
function mapCategory(category) {
  const mapping = {
    'Medical': 'Medical',
    'Health': 'Health',
    'Education': 'Education',
    'Environment': 'Environment',
    'Disaster Relief': 'Disaster Relief',
    'Community': 'Community',
    'Water': 'Environment',
    'Agriculture': 'Environment',
    'Food': 'Community',
    'Emergency': 'Disaster Relief',
    'Animal Welfare': 'Community',
    'Energy': 'Environment',
    'Women Empowerment': 'Community',
    'General': 'Other',
  }
  return mapping[category] || 'Other'
}

async function importData() {
  try {
    console.log('🔄 Connecting to MongoDB...')
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✅ Connected to MongoDB')

    // Read data files
    console.log('\n📂 Reading data files...')
    const campaigns100Path = 'c:\\Users\\sahil\\Downloads\\fundhope_campaigns_100.json'
    const campaigns50Path = 'c:\\Users\\sahil\\Downloads\\fundhope_campaigns_50.json'
    const donationsPath = 'c:\\Users\\sahil\\Downloads\\fundhope_donations_300.json'

    let campaigns100 = JSON.parse(fs.readFileSync(campaigns100Path, 'utf8'))
    let campaigns50 = JSON.parse(fs.readFileSync(campaigns50Path, 'utf8'))
    const donations300 = JSON.parse(fs.readFileSync(donationsPath, 'utf8'))

    console.log(`✅ 100 campaigns loaded`)
    console.log(`✅ 50 campaigns loaded`)
    console.log(`✅ 300 donations loaded`)

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...')
    await Campaign.deleteMany({})
    await Donation.deleteMany({})
    console.log('✅ Cleared old campaigns and donations')

    // Transform campaign data
    console.log('\n📊 Transforming campaign data...')
    
    // For campaigns100
    const processedCampaigns100 = campaigns100.map((campaign, index) => {
      const mappedCategory = mapCategory(campaign.category || 'General')
      const imageUrl = campaign.image || categoryImageMap[campaign.category] || '/campaigns/relief.jpg'
      const description = campaign.description && campaign.description.trim() ? campaign.description : `Support this important campaign to make a real difference in our community. Every contribution helps us reach our goal and create positive change.`
      
      return {
        _id: new mongoose.Types.ObjectId(),
        title: campaign.title || `Campaign ${index + 1}`,
        description: description,
        category: mappedCategory,
        goalAmount: campaign.goalAmount || 100000,
        currentAmount: campaign.raisedAmount || 0,
        deadline: campaign.deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        status: 'approved',
        createdBy: 'campaign_importer',
        creatorName: campaign.creator || 'Creator',
        location: campaign.location || 'India',
        imageUrl: imageUrl,
        createdAt: campaign.createdAt ? new Date(campaign.createdAt) : new Date(),
        updatedAt: new Date(),
      }
    })

    // For campaigns50 - handle if they have different structure
    const processedCampaigns50 = campaigns50.map((campaign, index) => {
      const mappedCategory = mapCategory(campaign.category || 'General')
      const imageUrl = campaign.imageUrl || campaign.image || categoryImageMap[campaign.category] || '/campaigns/relief.jpg'
      const description = campaign.description && campaign.description.trim() ? campaign.description : `Support this important campaign to make a real difference in our community. Every contribution helps us reach our goal and create positive change.`
      
      return {
        _id: new mongoose.Types.ObjectId(),
        title: campaign.title || `Campaign ${index + 101}`,
        description: description,
        category: mappedCategory,
        goalAmount: campaign.goalAmount || 100000,
        currentAmount: campaign.currentAmount || campaign.raisedAmount || 0,
        deadline: campaign.deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: campaign.status || 'approved',
        createdBy: campaign.createdBy || 'campaign_importer',
        creatorName: campaign.creatorName || campaign.creator || 'Creator',
        location: campaign.location || 'India',
        imageUrl: imageUrl,
        createdAt: campaign.createdAt ? new Date(campaign.createdAt) : new Date(),
        updatedAt: campaign.updatedAt ? new Date(campaign.updatedAt) : new Date(),
      }
    })

    // Merge all campaigns
    const allCampaigns = [...processedCampaigns100, ...processedCampaigns50]

    // Insert campaigns
    console.log(`📥 Inserting ${allCampaigns.length} campaigns...`)
    const campaignResult = await Campaign.insertMany(allCampaigns)
    console.log(`✅ Successfully inserted ${campaignResult.length} campaigns`)

    // Transform and insert donations
    console.log(`\n📥 Inserting ${donations300.length} donations...`)
    const processedDonations = donations300.map(donation => ({
      _id: donation._id || new mongoose.Types.ObjectId(),
      campaignId: donation.campaignId || allCampaigns[0]._id,
      userId: donation.userId || 'user_' + Math.random().toString(36).substr(2, 9),
      amount: donation.amount || 1000,
      donorName: donation.donorName || 'Donor',
      message: donation.message || '',
      createdAt: donation.createdAt ? new Date(donation.createdAt) : new Date(),
    }))

    const donationResult = await Donation.insertMany(processedDonations)
    console.log(`✅ Successfully inserted ${donationResult.length} donations`)

    // Calculate statistics
    console.log('\n📊 Calculating statistics...')
    const totalCampaigns = await Campaign.countDocuments()
    const activeCampaigns = await Campaign.countDocuments({ status: 'approved' })
    const totalRaisedAgg = await Campaign.aggregate([
      { $group: { _id: null, total: { $sum: '$currentAmount' } } }
    ])
    const totalRaised = totalRaisedAgg[0]?.total || 0
    const totalDonations = await Donation.countDocuments()

    console.log('\n✅ IMPORT COMPLETE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📊 Total Campaigns: ${totalCampaigns}`)
    console.log(`✅ Active Campaigns: ${activeCampaigns}`)
    console.log(`💰 Total Raised: ₹${totalRaised.toLocaleString('en-IN')}`)
    console.log(`🎁 Total Donations: ${totalDonations}`)
    console.log(`📸 All campaigns have images configured`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    process.exit(0)
  } catch (err) {
    console.error('❌ Error importing data:', err.message)
    console.error(err)
    process.exit(1)
  }
}

importData()

