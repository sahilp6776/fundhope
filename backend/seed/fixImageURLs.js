const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fundhope', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import Campaign model
const Campaign = require('../models/Campaign');

// Valid, working Unsplash image URLs for different categories
const validImages = {
  Medical: [
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde0a?w=400&h=300&fit=crop', // Medical equipment
    'https://images.unsplash.com/photo-1576091160550-2173b3f641e7?w=400&h=300&fit=crop', // Hospital
  ],
  Education: [
    'https://images.unsplash.com/photo-1427504494785-cdaa41d52470?w=400&h=300&fit=crop', // Classroom
    'https://images.unsplash.com/photo-1509391366360-2e938071d149?w=400&h=300&fit=crop', // Students
  ],
  Environment: [
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop', // Solar panel
    'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop', // Clean water
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop', // Nature
  ],
  'Disaster Relief': [
    'https://images.unsplash.com/photo-1576091160550-2173b3f641e7?w=400&h=300&fit=crop', // Emergency
  ],
  Health: [
    'https://images.unsplash.com/photo-1631217314831-c6227db76b6e?w=400&h=300&fit=crop', // Medical care
    'https://images.unsplash.com/photo-1587300411207-7ceefb8631d8?w=400&h=300&fit=crop', // Health
  ],
  Community: [
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop', // Community
    'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=400&h=300&fit=crop', // People helping
  ]
};

// Alternative fallback: Use simple placeholder images that always work
const fallbackImages = {
  Medical: 'https://via.placeholder.com/400x300?text=Medical+Equipment',
  Education: 'https://via.placeholder.com/400x300?text=Education',
  Environment: 'https://via.placeholder.com/400x300?text=Environment',
  'Disaster Relief': 'https://via.placeholder.com/400x300?text=Disaster+Relief',
  Health: 'https://via.placeholder.com/400x300?text=Health',
  Community: 'https://via.placeholder.com/400x300?text=Community',
  Other: 'https://via.placeholder.com/400x300?text=Campaign'
};

async function fixImages() {
  try {
    const Campaign = mongoose.model('Campaign');
    
    console.log('🔄 Fetching campaigns...');
    const campaigns = await Campaign.find();
    console.log(`📊 Found ${campaigns.length} campaigns`);
    
    let updated = 0;
    
    for (const campaign of campaigns) {
      const category = campaign.category;
      let newImageUrl;
      
      // Try to use a valid Unsplash URL for the category, otherwise use placeholder
      if (validImages[category] && validImages[category].length > 0) {
        // Rotate through valid images for variety
        const idx = Math.floor(Math.random() * validImages[category].length);
        newImageUrl = validImages[category][idx];
      } else {
        newImageUrl = fallbackImages[category] || fallbackImages.Other;
      }
      
      // Update the campaign
      await Campaign.updateOne({ _id: campaign._id }, { imageUrl: newImageUrl });
      updated++;
      console.log(`✅ Updated: "${campaign.title}"`);
      console.log(`   New URL: ${newImageUrl}`);
    }
    
    console.log('');
    console.log('🎉 All images fixed!');
    console.log(`✅ Updated ${updated} campaigns`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixImages();
