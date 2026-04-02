const mongoose = require('mongoose');
const Campaign = require('./models/Campaign');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fundhope')
  .then(async () => {
    const campaigns = await Campaign.find().limit(5).lean();
    console.log('✅ Sample Campaign Approval Dates:\n');
    campaigns.forEach((c, i) => {
      console.log(`${i+1}. ${c.title}`);
      console.log(`   📅 Approved: ${new Date(c.approvedAt)}`);
      console.log('');
    });
    
    const allCount = await Campaign.countDocuments();
    console.log(`📊 Total Campaigns: ${allCount}\n`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
