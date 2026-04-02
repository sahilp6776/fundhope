const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fundhope', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import Campaign model
const Campaign = require('../models/Campaign');

// Color-coded placeholder images that ALWAYS work
const placeholderImages = {
  Medical: 'https://via.placeholder.com/400x300/EF4444/FFFFFF?text=Medical+Supplies',
  Education: 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Education',
  Health: 'https://via.placeholder.com/400x300/F97316/FFFFFF?text=Health+Care',
  Environment: 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=Environment',
  'Disaster Relief': 'https://via.placeholder.com/400x300/DC2626/FFFFFF?text=Emergency',
  Community: 'https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Community',
  Other: 'https://via.placeholder.com/400x300/6B7280/FFFFFF?text=Campaign'
};

async function fixWithPlaceholders() {
  try {
    const campaigns = await Campaign.find();
    console.log('🔄 Updating all campaigns with reliable placeholder images\n');
    
    let updated = 0;
    for (const campaign of campaigns) {
      const newUrl = placeholderImages[campaign.category] || placeholderImages.Other;
      await Campaign.updateOne({ _id: campaign._id }, { imageUrl: newUrl });
      console.log(`✅ ${campaign.title}`);
      console.log(`   → ${newUrl}\n`);
      updated++;
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Fixed ${updated} campaigns`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 Images now use reliable placeholder.com URLs');
    console.log('✨ All images should display immediately!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixWithPlaceholders();
