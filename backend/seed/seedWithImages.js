// Enhanced seed script with campaign images
require('dotenv').config()
const mongoose = require('mongoose')
const Campaign = require('../models/Campaign')

// Campaign data with image references
const campaigns = [
  { title: "Medical Equipment for Rural Hospital", category: "Medical", goalAmount: 467938, currentAmount: 115247, creator: "Sneha Patil", location: "Karnataka", image: "/campaigns/hospital.jpg" },
  { title: "Solar Power for Rural Village", category: "Community", goalAmount: 414517, currentAmount: 314752, creator: "Rahul Sharma", location: "Uttar Pradesh", image: "/campaigns/solar.jpg" },
  { title: "Emergency Medical Aid Camp", category: "Medical", goalAmount: 196368, currentAmount: 98342, creator: "Meera Nair", location: "Karnataka", image: "/campaigns/medical-camp.jpg" },
  { title: "Disaster Relief Food Drive", category: "Disaster Relief", goalAmount: 81906, currentAmount: 51682, creator: "Kavya Reddy", location: "Maharashtra", image: "/campaigns/flood.jpg" },
  { title: "Women Skill Development Center", category: "Community", goalAmount: 188354, currentAmount: 54010, creator: "Priya Desai", location: "Assam", image: "/campaigns/women-training.jpg" },
  { title: "Flood Relief Campaign", category: "Disaster Relief", goalAmount: 267893, currentAmount: 107038, creator: "Meera Nair", location: "Gujarat", image: "/campaigns/flood.jpg" },
  { title: "Child Surgery Support", category: "Health", goalAmount: 358250, currentAmount: 20144, creator: "Sneha Patil", location: "Gujarat", image: "/campaigns/hospital.jpg" },
  { title: "Education Scholarships", category: "Education", goalAmount: 213849, currentAmount: 131059, creator: "Rahul Sharma", location: "Maharashtra", image: "/campaigns/school.jpg" },
  { title: "Support Farmers After Crop Loss", category: "Community", goalAmount: 167912, currentAmount: 99200, creator: "Karan Singh", location: "Gujarat", image: "/campaigns/farmers.jpg" },
  { title: "Food Support for Homeless Families", category: "Environment", goalAmount: 142046, currentAmount: 120126, creator: "Rohit Yadav", location: "Rajasthan", image: "/campaigns/food.jpg" },
  { title: "Support Animal Shelter", category: "Disaster Relief", goalAmount: 143818, currentAmount: 104040, creator: "Rohit Yadav", location: "Gujarat", image: "/campaigns/animal.jpg" },
  { title: "Cyclone Flood Relief", category: "Environment", goalAmount: 449551, currentAmount: 243672, creator: "Vikram Kapoor", location: "Tamil Nadu", image: "/campaigns/cyclone.jpg" },
  { title: "Homeless Meal Program", category: "Community", goalAmount: 301301, currentAmount: 253328, creator: "Vikram Kapoor", location: "Uttar Pradesh", image: "/campaigns/food.jpg" },
  { title: "Cyclone Emergency Fund", category: "Community", goalAmount: 413655, currentAmount: 252152, creator: "Kavya Reddy", location: "Maharashtra", image: "/campaigns/cyclone.jpg" },
  { title: "Ambulance for Rural Community", category: "Health", goalAmount: 140669, currentAmount: 24398, creator: "Manish Tiwari", location: "Maharashtra", image: "/campaigns/ambulance.jpg" },
  { title: "Student Education Support", category: "Disaster Relief", goalAmount: 121455, currentAmount: 119612, creator: "Karan Singh", location: "Rajasthan", image: "/campaigns/school.jpg" },
  { title: "Free Medical Camp Setup", category: "Disaster Relief", goalAmount: 243624, currentAmount: 135204, creator: "Meera Nair", location: "Rajasthan", image: "/campaigns/medical-camp.jpg" },
  { title: "Clean Energy Initiative", category: "Environment", goalAmount: 490303, currentAmount: 42121, creator: "Priya Desai", location: "Tamil Nadu", image: "/campaigns/solar.jpg" },
  { title: "Cyclone Reconstruction", category: "Community", goalAmount: 121091, currentAmount: 45189, creator: "Divya Shah", location: "Tamil Nadu", image: "/campaigns/cyclone.jpg" },
  { title: "College Scholarship Fund", category: "Education", goalAmount: 438779, currentAmount: 68387, creator: "Kavya Reddy", location: "Maharashtra", image: "/campaigns/school.jpg" },
  { title: "Animal Welfare Shelter", category: "Community", goalAmount: 169129, currentAmount: 156653, creator: "Manish Tiwari", location: "Gujarat", image: "/campaigns/animal.jpg" },
  { title: "Girls Education Program", category: "Education", goalAmount: 386637, currentAmount: 244235, creator: "Sneha Patil", location: "Gujarat", image: "/campaigns/school.jpg" },
  { title: "Community Pet Care", category: "Community", goalAmount: 213149, currentAmount: 185832, creator: "Kavya Reddy", location: "Delhi", image: "/campaigns/animal.jpg" },
  { title: "Hospital Equipment Fund", category: "Education", goalAmount: 464977, currentAmount: 203038, creator: "Amit Verma", location: "Karnataka", image: "/campaigns/hospital.jpg" },
  { title: "Rural Skills Training", category: "Community", goalAmount: 208265, currentAmount: 14189, creator: "Pooja Gupta", location: "Tamil Nadu", image: "/campaigns/women-training.jpg" },
  { title: "Free Medical Checkup Camp", category: "Community", goalAmount: 268977, currentAmount: 24575, creator: "Ananya Iyer", location: "Assam", image: "/campaigns/medical-camp.jpg" },
  { title: "Meals for Homeless", category: "Education", goalAmount: 141383, currentAmount: 109945, creator: "Aditya Jain", location: "Assam", image: "/campaigns/food.jpg" },
  { title: "Water Purification Project", category: "Disaster Relief", goalAmount: 145546, currentAmount: 116041, creator: "Pooja Gupta", location: "Gujarat", image: "/campaigns/water-project.jpg" },
  { title: "Health Awareness Program", category: "Medical", goalAmount: 193101, currentAmount: 168329, creator: "Meera Nair", location: "Rajasthan", image: "/campaigns/medical-camp.jpg" },
  { title: "Earthquake Relief Housing", category: "Community", goalAmount: 363853, currentAmount: 350874, creator: "Meera Nair", location: "Tamil Nadu", image: "/campaigns/relief.jpg" },
  { title: "Clean Water Initiative", category: "Disaster Relief", goalAmount: 406270, currentAmount: 394223, creator: "Amit Verma", location: "Rajasthan", image: "/campaigns/water-project.jpg" },
  { title: "Prevention Health Camp", category: "Environment", goalAmount: 137117, currentAmount: 31580, creator: "Rohit Yadav", location: "Maharashtra", image: "/campaigns/medical-camp.jpg" },
  { title: "Food Bank Setup", category: "Medical", goalAmount: 283229, currentAmount: 253389, creator: "Divya Shah", location: "Karnataka", image: "/campaigns/food.jpg" },
  { title: "Higher Education Fund", category: "Education", goalAmount: 346191, currentAmount: 27610, creator: "Amit Verma", location: "Rajasthan", image: "/campaigns/school.jpg" },
  { title: "Wheelchairs Distribution", category: "Community", goalAmount: 313305, currentAmount: 166949, creator: "Kavya Reddy", location: "Maharashtra", image: "/campaigns/relief.jpg" },
  { title: "Disaster Relief Training", category: "Disaster Relief", goalAmount: 378121, currentAmount: 271186, creator: "Sneha Patil", location: "Rajasthan", image: "/campaigns/disaster.jpg" },
  { title: "Renewable Energy Project", category: "Disaster Relief", goalAmount: 154621, currentAmount: 26362, creator: "Priya Desai", location: "Rajasthan", image: "/campaigns/solar.jpg" },
  { title: "Environmental Conservation", category: "Environment", goalAmount: 398122, currentAmount: 155414, creator: "Divya Shah", location: "Rajasthan", image: "/campaigns/environment.jpg" },
  { title: "Rural Ambulance Service", category: "Medical", goalAmount: 271844, currentAmount: 80200, creator: "Priya Desai", location: "Maharashtra", image: "/campaigns/ambulance.jpg" },
  { title: "Maternal Healthcare Fund", category: "Medical", goalAmount: 333613, currentAmount: 272058, creator: "Rohit Yadav", location: "Rajasthan", image: "/campaigns/hospital.jpg" },
  { title: "Emergency Food Distribution", category: "Disaster Relief", goalAmount: 330662, currentAmount: 19105, creator: "Aditya Jain", location: "Assam", image: "/campaigns/food.jpg" },
  { title: "Child Surgery Support", category: "Medical", goalAmount: 122345, currentAmount: 122094, creator: "Karan Singh", location: "Rajasthan", image: "/campaigns/hospital.jpg" },
  { title: "Renewable Energy Initiative", category: "Community", goalAmount: 194243, currentAmount: 55978, creator: "Divya Shah", location: "Rajasthan", image: "/campaigns/solar.jpg" },
  { title: "Rural Van Service", category: "Community", goalAmount: 421362, currentAmount: 98300, creator: "Karan Singh", location: "Maharashtra", image: "/campaigns/relief.jpg" },
  { title: "Farmer Support Program", category: "Medical", goalAmount: 304510, currentAmount: 201946, creator: "Pooja Gupta", location: "Karnataka", image: "/campaigns/farmers.jpg" },
  { title: "Scholarship Distribution", category: "Education", goalAmount: 485937, currentAmount: 473386, creator: "Aditya Jain", location: "Rajasthan", image: "/campaigns/school.jpg" },
  { title: "Flood Victim Relief", category: "Education", goalAmount: 106762, currentAmount: 47779, creator: "Manish Tiwari", location: "Maharashtra", image: "/campaigns/flood.jpg" },
  { title: "Healthcare Outreach", category: "Medical", goalAmount: 394443, currentAmount: 87398, creator: "Pooja Gupta", location: "Assam", image: "/campaigns/medical-camp.jpg" },
  { title: "Infrastructure Development", category: "Community", goalAmount: 482798, currentAmount: 268516, creator: "Aditya Jain", location: "Assam", image: "/campaigns/relief.jpg" },
  { title: "Emergency Aid Fund", category: "Education", goalAmount: 162439, currentAmount: 42554, creator: "Rohit Yadav", location: "Delhi", image: "/campaigns/relief.jpg" },
]

const demoUserId = 'demo_user_images_001'

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fundhope'
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')

    // Clear existing
    await Campaign.deleteMany({})
    console.log('🗑️  Cleared existing campaigns')

    // Transform and insert with images
    const campaignData = campaigns.map((c, index) => ({
      title: c.title,
      description: `${c.title} - Supporting the community in ${c.location}. Your donation will make a real difference in our region.`,
      category: normalizeCategoryName(c.category),
      goalAmount: c.goalAmount,
      currentAmount: c.currentAmount,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: 'approved',
      createdBy: demoUserId,
      creatorName: c.creator,
      imageUrl: c.image, // Local image path
      createdAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000))
    }))

    const result = await Campaign.insertMany(campaignData)
    console.log(`✅ Inserted ${result.length} campaigns`)

    // Statistics
    const totalGoal = campaignData.reduce((sum, c) => sum + c.goalAmount, 0)
    const totalRaised = campaignData.reduce((sum, c) => sum + c.currentAmount, 0)

    console.log(`
📊 Campaign Statistics:
   ✅ Total Campaigns: ${campaignData.length}
   💰 Total Goal: ₹${totalGoal.toLocaleString('en-IN')}
   🎯 Total Raised: ₹${totalRaised.toLocaleString('en-IN')}
   🖼️  Images Configured: /campaigns/ folder
   📊 Overall Progress: ${((totalRaised / totalGoal) * 100).toFixed(1)}%
    `)

    console.log(`
📁 Image Folder Structure:
   Location: /frontend/public/campaigns/
   Add these image files:
   ✓ hospital.jpg
   ✓ flood.jpg
   ✓ school.jpg
   ✓ animal.jpg
   ✓ solar.jpg
   ✓ medical-camp.jpg
   ✓ women-training.jpg
   ✓ water-project.jpg
   ✓ farmers.jpg
   ✓ cyclone.jpg
   ✓ food.jpg
   ✓ relief.jpg
   ✓ disaster.jpg
   ✓ environment.jpg
   ✓ ambulance.jpg
    `)

    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error.message)
    process.exit(1)
  }
}

function normalizeCategoryName(category) {
  const mapping = {
    'Medical': 'Medical',
    'Health': 'Health',
    'Education': 'Education',
    'Environment': 'Environment',
    'Disaster Relief': 'Disaster Relief',
    'Community': 'Community',
    'Other': 'Other'
  }
  return mapping[category] || 'Other'
}

seedDatabase()
