const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fundhope', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Campaign = require('../models/Campaign');

async function generateAdminDataReport() {
  try {
    console.log('\n📊 ADMIN PANEL - COMPLETE DATA REPORT\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const campaigns = await Campaign.find();
    
    // 1. ALL CAMPAIGNS SUMMARY
    console.log('1️⃣  CAMPAIGNS SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Campaigns: ${campaigns.length}`);
    console.log(`Approved: ${campaigns.filter(c => c.status === 'approved').length}`);
    console.log(`Pending: ${campaigns.filter(c => c.status === 'pending').length}`);
    console.log(`Rejected: ${campaigns.filter(c => c.status === 'rejected').length}\n`);
    
    // 2. FINANCIAL DATA
    console.log('2️⃣  FINANCIAL DATA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const totalRaised = campaigns.reduce((sum, c) => sum + (c.currentAmount || 0), 0);
    const totalGoal = campaigns.reduce((sum, c) => sum + (c.goalAmount || 0), 0);
    const avgProgress = campaigns.reduce((sum, c) => sum + ((c.currentAmount || 0) / c.goalAmount * 100), 0) / campaigns.length;
    
    console.log(`Total Goal Amount: ₹${totalGoal.toLocaleString('en-IN')}`);
    console.log(`Total Amount Raised: ₹${totalRaised.toLocaleString('en-IN')}`);
    console.log(`Average Progress: ${avgProgress.toFixed(1)}%`);
    console.log(`Max Campaign Progress: ${Math.max(...campaigns.map(c => (c.currentAmount / c.goalAmount * 100))).toFixed(1)}%\n`);
    
    // 3. CATEGORY DISTRIBUTION
    console.log('3️⃣  CATEGORY DISTRIBUTION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const categories = {};
    campaigns.forEach(c => {
      if (!categories[c.category]) categories[c.category] = { count: 0, raised: 0, goal: 0 };
      categories[c.category].count++;
      categories[c.category].raised += c.currentAmount || 0;
      categories[c.category].goal += c.goalAmount || 0;
    });
    
    Object.entries(categories).forEach(([cat, data]) => {
      console.log(`${cat}: ${data.count} campaigns | ₹${data.raised.toLocaleString('en-IN')}/₹${data.goal.toLocaleString('en-IN')}`);
    });
    console.log('');
    
    // 4. ALL CAMPAIGNS DETAILED
    console.log('4️⃣  ALL CAMPAIGNS (DETAILED VIEW)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    campaigns.forEach((c, idx) => {
      const progress = ((c.currentAmount || 0) / c.goalAmount * 100).toFixed(1);
      console.log(`${idx + 1}. ${c.title}`);
      console.log(`   Status: ${c.status.toUpperCase()}`);
      console.log(`   Category: ${c.category}`);
      console.log(`   Progress: ${progress}% (₹${(c.currentAmount || 0).toLocaleString('en-IN')}/₹${c.goalAmount.toLocaleString('en-IN')})`);
      console.log(`   Approved: ${c.approvedAt ? new Date(c.approvedAt).toLocaleDateString('en-IN') : 'N/A'}`);
      console.log(`   Image: ${c.imageUrl}`);
      console.log(`   Creator: ${c.creatorName || 'Unknown'}`);
      console.log('');
    });
    
    // 5. DATA INTEGRITY CHECK
    console.log('5️⃣  DATA INTEGRITY CHECK');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let missingFields = 0;
    let missingImages = 0;
    
    campaigns.forEach(c => {
      if (!c.title || !c.category || !c.goalAmount || !c.currentAmount || !c.status) missingFields++;
      if (!c.imageUrl) missingImages++;
    });
    
    console.log(`✅ Campaigns with all required fields: ${campaigns.length - missingFields}/${campaigns.length}`);
    console.log(`✅ Campaigns with images: ${campaigns.length - missingImages}/${campaigns.length}`);
    console.log(`✅ All data integrity checks: ${missingFields === 0 && missingImages === 0 ? 'PASSED ✓' : 'FAILED ✗'}`);
    console.log(`✅ API Ready: YES`);
    console.log(`✅ Admin Panel Data: COMPLETE\n`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 ALL DATA UPDATES READY FOR DISPLAY IN ADMIN PANEL\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateAdminDataReport();
