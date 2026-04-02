const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fundhope', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import Campaign model
const Campaign = require('../models/Campaign');

// Color-coded placehold.co images (very reliable, no DNS issues)
const placeholderImages = {
  Medical: 'https://placehold.co/400x300/EF4444/FFFFFF?text=Medical',
  Education: 'https://placehold.co/400x300/3B82F6/FFFFFF?text=Education',
  Health: 'https://placehold.co/400x300/F97316/FFFFFF?text=Health',
  Environment: 'https://placehold.co/400x300/10B981/FFFFFF?text=Environment',
  'Disaster Relief': 'https://placehold.co/400x300/DC2626/FFFFFF?text=Emergency',
  Community: 'https://placehold.co/400x300/8B5CF6/FFFFFF?text=Community',
  Other: 'https://placehold.co/400x300/6B7280/FFFFFF?text=Campaign'
};

async function fixWithPlaceholders() {
  try {
    const campaigns = await Campaign.find();
    console.log('🔄 Updating all campaigns with placehold.co images\n');
    
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
    console.log('\n💡 Images now use placehold.co (100% reliable)');
    console.log('✨ All images should display immediately!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixWithPlaceholders();
