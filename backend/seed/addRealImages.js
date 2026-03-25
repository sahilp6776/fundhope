const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fundhope', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import Campaign model
const Campaign = require('../models/Campaign');

// Real images from Picsum (100% reliable, always works)
// Picsum.photos provides real photos from Lorem Picsum
const categoryImages = {
  Medical: [
    'https://picsum.photos/400/300?random=11', // Medical 1
    'https://picsum.photos/400/300?random=12', // Medical 2
    'https://picsum.photos/400/300?random=13', // Medical 3
  ],
  Education: [
    'https://picsum.photos/400/300?random=21', // Education 1
    'https://picsum.photos/400/300?random=22', // Education 2
  ],
  Environment: [
    'https://picsum.photos/400/300?random=31', // Environment 1
    'https://picsum.photos/400/300?random=32', // Environment 2
    'https://picsum.photos/400/300?random=33', // Environment 3
    'https://picsum.photos/400/300?random=34', // Environment 4
  ],
  'Disaster Relief': [
    'https://picsum.photos/400/300?random=41', // Disaster 1
    'https://picsum.photos/400/300?random=42', // Disaster 2
    'https://picsum.photos/400/300?random=43', // Disaster 3
  ],
  Health: [
    'https://picsum.photos/400/300?random=51', // Health 1
    'https://picsum.photos/400/300?random=52', // Health 2
    'https://picsum.photos/400/300?random=53', // Health 3
    'https://picsum.photos/400/300?random=54', // Health 4
  ],
  Community: [
    'https://picsum.photos/400/300?random=61', // Community 1
    'https://picsum.photos/400/300?random=62', // Community 2
    'https://picsum.photos/400/300?random=63', // Community 3
    'https://picsum.photos/400/300?random=64', // Community 4
  ],
  Other: [
    'https://picsum.photos/400/300?random=99', // Other
  ]
};

async function updateWithRealImages() {
  try {
    const campaigns = await Campaign.find();
    console.log('🔄 Updating campaigns with REAL images from Picsum\n');
    
    let updated = 0;
    let imageIndex = {};
    
    for (const campaign of campaigns) {
      const category = campaign.category;
      const images = categoryImages[category] || categoryImages.Other;
      
      // Cycle through images for each category
      if (!imageIndex[category]) imageIndex[category] = 0;
      const imageUrl = images[imageIndex[category] % images.length];
      imageIndex[category]++;
      
      await Campaign.updateOne({ _id: campaign._id }, { imageUrl });
      console.log(`✅ ${campaign.title}`);
      console.log(`   📷 ${imageUrl}\n`);
      updated++;
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Updated ${updated} campaigns`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🖼️  Real images from Picsum.photos');
    console.log('✨ All campaigns now have REAL photos!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateWithRealImages();
