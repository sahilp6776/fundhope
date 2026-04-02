const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fundhope', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import Campaign model
const Campaign = require('../models/Campaign');

async function updateCampaignsUnder40Percent() {
  try {
    console.log('📉 Updating all campaigns to under 40% progress...\n');
    
    const campaigns = await Campaign.find();
    let updated = 0;
    let totalRaised = 0;
    
    for (const campaign of campaigns) {
      // Calculate 35% of goal amount (keeping it under 40%, using 35% for safety margin)
      const maxAmount = Math.floor(campaign.goalAmount * 0.35);
      
      // Update the campaign
      await Campaign.updateOne(
        { _id: campaign._id },
        { currentAmount: maxAmount }
      );
      
      totalRaised += maxAmount;
      const progressPercent = Math.round((maxAmount / campaign.goalAmount) * 100);
      
      console.log(`✅ ${campaign.title}`);
      console.log(`   Goal: ₹${campaign.goalAmount} | New Amount: ₹${maxAmount} [${progressPercent}%]\n`);
      updated++;
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Updated ${updated} campaigns`);
    console.log(`💰 Total Amount Raised: ₹${totalRaised}`);
    console.log(`📊 New Average Progress: 35%`);
    console.log(`🔒 Max Progress: Under 40%`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateCampaignsUnder40Percent();
