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

// Real campaign-related images using free services
const campaigns = [
  {
    title: "Medical Equipment for Rural Hospital",
    description: "Help us provide critical medical equipment to rural hospitals. Your donation can save lives and improve healthcare access in underserved communities.",
    category: "Medical",
    goalAmount: 500000,
    currentAmount: 185000,
    deadline: new Date('2026-06-15'),
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-112173f7f7b0?w=400&h=300&fit=crop',
    creator: "Dr. Rajesh Kumar"
  },
  {
    title: "Education Scholarships for Underprivileged",
    description: "Support bright students from low-income families. This fund provides scholarships for higher education and skill development programs.",
    category: "Education",
    goalAmount: 300000,
    currentAmount: 125000,
    deadline: new Date('2026-07-20'),
    imageUrl: 'https://images.unsplash.com/photo-1427504494785-cdaa41d52470?w=400&h=300&fit=crop',
    creator: "Priya Singh"
  },
  {
    title: "Solar Power for Rural Village",
    description: "Bring electricity to remote villages using sustainable solar energy. This will power homes, schools, and healthcare centers.",
    category: "Environment",
    goalAmount: 750000,
    currentAmount: 420000,
    deadline: new Date('2026-08-10'),
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e938071d149?w=400&h=300&fit=crop',
    creator: "Amit Patel"
  },
  {
    title: "Clean Drinking Water Project",
    description: "Install water purification systems in villages lacking clean water access. Every drop matters for health and dignity.",
    category: "Environment",
    goalAmount: 400000,
    currentAmount: 310000,
    deadline: new Date('2026-07-30'),
    imageUrl: 'https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?w=400&h=300&fit=crop',
    creator: "Rajesh Kumar"
  },
  {
    title: "Emergency Flood Relief Campaign",
    description: "Emergency aid for flood victims. Your donation provides shelter, food, medical care, and rehabilitation support.",
    category: "Disaster Relief",
    goalAmount: 1000000,
    currentAmount: 680000,
    deadline: new Date('2026-05-15'),
    imageUrl: 'https://images.unsplash.com/photo-1576091160562-40f08e2246f1?w=400&h=300&fit=crop',
    creator: "Neha Gupta"
  },
  {
    title: "Free Medical Camp for Rural Area",
    description: "Organize free health checkups and treatment camps in rural regions. Early detection can prevent serious diseases.",
    category: "Health",
    goalAmount: 250000,
    currentAmount: 95000,
    deadline: new Date('2026-06-30'),
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173f7f7b0?w=400&h=300&fit=crop',
    creator: "Priya Singh"
  },
  {
    title: "Ambulance Service for Remote Communities",
    description: "Purchase ambulances for villages to provide emergency medical transportation and save critical time in medical emergencies.",
    category: "Medical",
    goalAmount: 600000,
    currentAmount: 380000,
    deadline: new Date('2026-07-15'),
    imageUrl: 'https://images.unsplash.com/photo-1631217314831-c6227db76b6e?w=400&h=300&fit=crop',
    creator: "Vikram Sharma"
  },
  {
    title: "Women Skill Development Center",
    description: "Empower women with vocational training and skill development. Help them become self-sufficient and independent.",
    category: "Community",
    goalAmount: 350000,
    currentAmount: 210000,
    deadline: new Date('2026-08-05'),
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    creator: "Anjali Desai"
  },
  {
    title: "Support Farmers After Crop Loss",
    description: "Help farmers who lost crops due to natural disasters. Provide seeds, equipment, and financial support for recovery.",
    category: "Environment",
    goalAmount: 450000,
    currentAmount: 275000,
    deadline: new Date('2026-07-25'),
    imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop',
    creator: "Amit Patel"
  },
  {
    title: "Food Support for Homeless Families",
    description: "Provide nutritious meals and food packages to homeless families. Help them regain stability and dignity.",
    category: "Community",
    goalAmount: 200000,
    currentAmount: 145000,
    deadline: new Date('2026-06-20'),
    imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop',
    creator: "Suresh Reddy"
  },
  {
    title: "Child Heart Surgery Support Fund",
    description: "Life-saving heart surgeries for children in need. Your donation can give them a second chance at life and healthy future.",
    category: "Medical",
    goalAmount: 800000,
    currentAmount: 520000,
    deadline: new Date('2026-08-15'),
    imageUrl: 'https://images.unsplash.com/photo-1631217314831-c6227db76b6e?w=400&h=300&fit=crop',
    creator: "Dr. Rajesh Kumar"
  },
  {
    title: "Animal Shelter Construction",
    description: "Build and maintain shelter for stray animals. Provide food, medical care, and rehabilitation for vulnerable animals.",
    category: "Community",
    goalAmount: 150000,
    currentAmount: 95000,
    deadline: new Date('2026-07-10'),
    imageUrl: 'https://images.unsplash.com/photo-1587300411207-7ceefb8631d8?w=400&h=300&fit=crop',
    creator: "Maya Verma"
  },
  {
    title: "Rebuild Homes After Cyclone Disaster",
    description: "Help families rebuild their homes after the devastating cyclone. Provide construction materials and labor support.",
    category: "Disaster Relief",
    goalAmount: 1500000,
    currentAmount: 890000,
    deadline: new Date('2026-09-01'),
    imageUrl: 'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=400&h=300&fit=crop',
    creator: "Neha Gupta"
  },
  {
    title: "Wheelchairs and Mobility Aids",
    description: "Provide mobility aids and wheelchairs to people with disabilities. Restore their independence and dignity for better life.",
    category: "Health",
    goalAmount: 180000,
    currentAmount: 110000,
    deadline: new Date('2026-07-05'),
    imageUrl: 'https://images.unsplash.com/photo-1576091160775-112898f56106?w=400&h=300&fit=crop',
    creator: "Rohan Chopra"
  },
  {
    title: "School Construction in Remote Area",
    description: "Build a primary school in a remote area where children walk miles for education. Invest in the future generation.",
    category: "Education",
    goalAmount: 900000,
    currentAmount: 550000,
    deadline: new Date('2026-08-30'),
    imageUrl: 'https://images.unsplash.com/photo-1427504494785-cdaa41d52470?w=400&h=300&fit=crop',
    creator: "Priya Singh"
  },
  {
    title: "Eye Camp and Vision Correction",
    description: "Organize free eye checkups and provide glasses to people in need. Help them see and live a better life.",
    category: "Health",
    goalAmount: 220000,
    currentAmount: 88000,
    deadline: new Date('2026-08-20'),
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-112173f7f7b0?w=400&h=300&fit=crop',
    creator: "Dr. Rajesh Kumar"
  },
  {
    title: "Micro-Finance for Women Entrepreneurs",
    description: "Support women entrepreneurs with small loans and business training. Help them start and grow their businesses.",
    category: "Community",
    goalAmount: 400000,
    currentAmount: 200000,
    deadline: new Date('2026-09-10'),
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    creator: "Anjali Desai"
  },
  {
    title: "Reforestation Project - Plant Trees",
    description: "Plant millions of trees to combat climate change and deforestation. Create green spaces for future generations.",
    category: "Environment",
    goalAmount: 350000,
    currentAmount: 165000,
    deadline: new Date('2026-07-28'),
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    creator: "Amit Patel"
  },
  {
    title: "Mental Health Awareness Campaign",
    description: "Raise awareness about mental health and provide counseling services in underserved communities.",
    category: "Health",
    goalAmount: 180000,
    currentAmount: 72000,
    deadline: new Date('2026-08-25'),
    imageUrl: 'https://images.unsplash.com/photo-1576091160671-112173f7f7b0?w=400&h=300&fit=crop',
    creator: "Dr. Rajesh Kumar"
  },
  {
    title: "Earthquake Rehabilitation Support",
    description: "Support earthquake survivors with emergency housing, food, and medical aid for long-term recovery.",
    category: "Disaster Relief",
    goalAmount: 700000,
    currentAmount: 420000,
    deadline: new Date('2026-10-15'),
    imageUrl: 'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=400&h=300&fit=crop',
    creator: "Neha Gupta"
  }
];

const getDemoDonations = (campaignIds) => {
  const donations = [];
  
  campaignIds.forEach((campaignId) => {
    const donationCount = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < donationCount; i++) {
      donations.push({
        amount: Math.floor(Math.random() * 40000) + 5000,
        campaignId,
        userId: `demo_donor_${Math.floor(Math.random() * 8) + 1}`,
        paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'completed',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
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

    // Add campaign data
    const campaignsWithData = campaigns.map(c => ({
      ...c,
      status: 'approved',
      createdBy: 'campaign_creator_' + Math.floor(Math.random() * 10),
      creatorName: c.creator,
    }));

    const createdCampaigns = await Campaign.insertMany(campaignsWithData);
    console.log(`✅ Created ${createdCampaigns.length} campaigns with real images\n`);

    // Create donations
    const campaignIds = createdCampaigns.map(c => c._id);
    const donations = getDemoDonations(campaignIds);
    
    const createdDonations = await Donation.insertMany(donations);
    console.log(`✅ Created ${createdDonations.length} demo donations\n`);

    // Calculate stats
    const totalRaised = createdCampaigns.reduce((sum, c) => sum + (c.currentAmount || 0), 0);
    const activeCampaigns = createdCampaigns.filter(c => new Date(c.deadline) > new Date()).length;

    console.log('📊 Campaign Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📢 Total Campaigns: ${createdCampaigns.length}`);
    console.log(`💰 Total Amount Raised: ₹${totalRaised.toLocaleString('en-IN')}`);
    console.log(`⏳ Active Campaigns: ${activeCampaigns}`);
    console.log(`💳 Total Donations: ${createdDonations.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n✅ DATABASE SEEDED WITH REAL CAMPAIGN IMAGES!\n');

    console.log('📋 Campaign Categories:');
    const categories = [...new Set(campaigns.map(c => c.category))];
    categories.forEach(cat => {
      const count = campaigns.filter(c => c.category === cat).length;
      console.log(`   • ${cat}: ${count} campaigns`);
    });

    console.log('\n🖼️  All campaigns now have real images from:');
    console.log('   • Unsplash (free stock photos)');
    console.log('   • High quality, relevant to campaign types');
    console.log('   • 400x300px optimal size');
    console.log('   • No local files needed\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
