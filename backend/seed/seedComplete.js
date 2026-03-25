const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fundhope', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Models
const campaignSchema = new mongoose.Schema({}, { strict: false });
const donationSchema = new mongoose.Schema({}, { strict: false });
const Campaign = mongoose.model('Campaign', campaignSchema, 'campaigns');
const Donation = mongoose.model('Donation', donationSchema, 'donations');

// Image mapping by category
const categoryImages = {
  'Education': '/campaigns/school.jpg',
  'Health': '/campaigns/medical-camp.jpg',
  'Medical': '/campaigns/hospital.jpg',
  'Environment': '/campaigns/environment.jpg',
  'Disaster Relief': '/campaigns/relief.jpg',
  'Community': '/campaigns/food.jpg',
  'Other': '/campaigns/flood.jpg'
};

// Demo campaign data
const demoCampaigns = [
  {
    title: "Medical Equipment for Rural Hospital",
    description: "Help us provide critical medical equipment to rural hospitals. Your donation can save lives and improve healthcare access in underserved communities.",
    category: "Medical",
    goalAmount: 500000,
    currentAmount: 185000,
    deadline: new Date('2026-06-15'),
    status: "approved",
    createdBy: "demo_user_1",
    creatorName: "Dr. Rajesh Kumar"
  },
  {
    title: "Education Scholarships for Underprivileged",
    description: "Support bright students from low-income families. This fund provides scholarships for higher education and skill development programs.",
    category: "Education",
    goalAmount: 300000,
    currentAmount: 125000,
    deadline: new Date('2026-07-20'),
    status: "approved",
    createdBy: "demo_user_2",
    creatorName: "Priya Singh"
  },
  {
    title: "Solar Power for Rural Village",
    description: "Bring electricity to remote villages using sustainable solar energy. This will power homes, schools, and healthcare centers.",
    category: "Environment",
    goalAmount: 750000,
    currentAmount: 420000,
    deadline: new Date('2026-08-10'),
    status: "approved",
    createdBy: "demo_user_3",
    creatorName: "Amit Patel"
  },
  {
    title: "Clean Drinking Water Project",
    description: "Install water purification systems in villages lacking clean water access. Every drop matters for health and dignity.",
    category: "Environment",
    goalAmount: 400000,
    currentAmount: 310000,
    deadline: new Date('2026-07-30'),
    status: "approved",
    createdBy: "demo_user_1",
    creatorName: "Dr. Rajesh Kumar"
  },
  {
    title: "Flood Relief Campaign",
    description: "Emergency aid for flood victims. Your donation provides shelter, food, medical care, and rehabilitation support.",
    category: "Disaster Relief",
    goalAmount: 1000000,
    currentAmount: 680000,
    deadline: new Date('2026-05-15'),
    status: "approved",
    createdBy: "demo_user_4",
    creatorName: "Neha Gupta"
  },
  {
    title: "Free Medical Camp for Rural Area",
    description: "Organize free health checkups and treatment camps in rural regions. Early detection can prevent serious diseases.",
    category: "Health",
    goalAmount: 250000,
    currentAmount: 95000,
    deadline: new Date('2026-06-30'),
    status: "approved",
    createdBy: "demo_user_2",
    creatorName: "Priya Singh"
  },
  {
    title: "Ambulance for Rural Community",
    description: "Purchase ambulances for villages to provide emergency medical transportation and save critical time in medical emergencies.",
    category: "Medical",
    goalAmount: 600000,
    currentAmount: 380000,
    deadline: new Date('2026-07-15'),
    status: "approved",
    createdBy: "demo_user_5",
    creatorName: "Vikram Sharma"
  },
  {
    title: "Women Skill Development Center",
    description: "Empower women with vocational training and skill development. Help them become self-sufficient and independent.",
    category: "Community",
    goalAmount: 350000,
    currentAmount: 210000,
    deadline: new Date('2026-08-05'),
    status: "approved",
    createdBy: "demo_user_6",
    creatorName: "Anjali Desai"
  },
  {
    title: "Support Farmers After Crop Loss",
    description: "Help farmers who lost crops due to natural disasters. Provide seeds, equipment, and financial support for recovery.",
    category: "Environment",
    goalAmount: 450000,
    currentAmount: 275000,
    deadline: new Date('2026-07-25'),
    status: "approved",
    createdBy: "demo_user_3",
    creatorName: "Amit Patel"
  },
  {
    title: "Food Support for Homeless Families",
    description: "Provide nutritious meals and food packages to homeless families. Help them regain stability and dignity.",
    category: "Community",
    goalAmount: 200000,
    currentAmount: 145000,
    deadline: new Date('2026-06-20'),
    status: "approved",
    createdBy: "demo_user_7",
    creatorName: "Suresh Reddy"
  },
  {
    title: "Child Heart Surgery Support",
    description: "Life-saving heart surgeries for children in need. Your donation can give them a second chance at life.",
    category: "Medical",
    goalAmount: 800000,
    currentAmount: 520000,
    deadline: new Date('2026-08-15'),
    status: "approved",
    createdBy: "demo_user_1",
    creatorName: "Dr. Rajesh Kumar"
  },
  {
    title: "Support Stray Animal Shelter",
    description: "Build and maintain shelter for stray animals. Provide food, medical care, and rehabilitation.",
    category: "Community",
    goalAmount: 150000,
    currentAmount: 95000,
    deadline: new Date('2026-07-10'),
    status: "approved",
    createdBy: "demo_user_8",
    creatorName: "Maya Verma"
  },
  {
    title: "Rebuild Homes After Cyclone",
    description: "Help families rebuild their homes after the devastating cyclone. Provide construction materials and labor support.",
    category: "Disaster Relief",
    goalAmount: 1500000,
    currentAmount: 890000,
    deadline: new Date('2026-09-01'),
    status: "approved",
    createdBy: "demo_user_4",
    creatorName: "Neha Gupta"
  },
  {
    title: "Wheelchairs for Disabled People",
    description: "Provide mobility aids and wheelchairs to people with disabilities. Restore their independence and dignity.",
    category: "Health",
    goalAmount: 180000,
    currentAmount: 110000,
    deadline: new Date('2026-07-05'),
    status: "approved",
    createdBy: "demo_user_9",
    creatorName: "Rohan Chopra"
  },
  {
    title: "School Construction in Remote Area",
    description: "Build a primary school in a remote area where children walk miles for education. Invest in the future generation.",
    category: "Education",
    goalAmount: 900000,
    currentAmount: 550000,
    deadline: new Date('2026-08-30'),
    status: "approved",
    createdBy: "demo_user_2",
    creatorName: "Priya Singh"
  }
];

// Demo donation data (will be created after campaigns)
const getDemoDonations = (campaignIds) => {
  const donations = [];
  const donorNames = ['Rahul', 'Sneha', 'Arjun', 'Divya', 'Karan', 'Zara', 'Nikhil', 'Pooja'];
  
  campaignIds.forEach((campaignId, index) => {
    // Add 3-5 donations per campaign
    const donationCount = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < donationCount; i++) {
      donations.push({
        amount: Math.floor(Math.random() * 40000) + 5000, // 5k to 45k
        campaignId,
        userId: `demo_donor_${Math.floor(Math.random() * 8) + 1}`,
        paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'completed',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
      });
    }
  });
  
  return donations;
};

async function seedDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing campaigns and donations...');
    await Campaign.deleteMany({});
    await Donation.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Create campaigns with images
    console.log('📝 Creating demo campaigns...');
    const campaignsWithImages = demoCampaigns.map(campaign => ({
      ...campaign,
      imageUrl: categoryImages[campaign.category] || categoryImages['Other']
    }));

    const createdCampaigns = await Campaign.insertMany(campaignsWithImages);
    console.log(`✅ Created ${createdCampaigns.length} campaigns\n`);

    // Create donations
    console.log('💰 Creating demo donations...');
    const campaignIds = createdCampaigns.map(c => c._id);
    const donations = getDemoDonations(campaignIds);
    
    const createdDonations = await Donation.insertMany(donations);
    console.log(`✅ Created ${createdDonations.length} donations\n`);

    // Calculate stats
    const totalRaised = createdCampaigns.reduce((sum, c) => sum + (c.currentAmount || 0), 0);
    const totalDonators = new Set(donations.map(d => d.userId)).size;
    const activeCampaigns = createdCampaigns.filter(c => new Date(c.deadline) > new Date()).length;

    console.log('📊 Seed Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📢 Total Campaigns: ${createdCampaigns.length}`);
    console.log(`💰 Total Amount Raised: ₹${totalRaised.toLocaleString('en-IN')}`);
    console.log(`👥 Demo Donors/Users: ${totalDonators}`);
    console.log(`⏳ Active Campaigns: ${activeCampaigns}`);
    console.log(`💳 Total Donations: ${createdDonations.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n✅ DATABASE SEEDED SUCCESSFULLY!\n');

    console.log('📋 Demo User IDs (for testing login in Clerk):');
    ['demo_user_1', 'demo_user_2', 'demo_user_3', 'demo_user_4', 'demo_user_5'].forEach(user => {
      console.log(`   • ${user}`);
    });

    console.log('\n📋 Demo Donor IDs:');
    ['demo_donor_1', 'demo_donor_2', 'demo_donor_3', 'demo_donor_4', 'demo_donor_5'].forEach(user => {
      console.log(`   • ${user}`);
    });

    console.log('\n📁 Image Files Available:');
    console.log('   • /campaigns/school.jpg (Education)');
    console.log('   • /campaigns/hospital.jpg (Medical)');
    console.log('   • /campaigns/medical-camp.jpg (Health)');
    console.log('   • /campaigns/environment.jpg (Environment)');
    console.log('   • /campaigns/relief.jpg (Disaster Relief)');
    console.log('   • /campaigns/food.jpg (Community)');
    console.log('   • And 9 more image files...\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
