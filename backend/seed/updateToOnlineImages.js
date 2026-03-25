const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fundhope', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const campaignSchema = new mongoose.Schema({}, { strict: false });
const Campaign = mongoose.model('Campaign', campaignSchema, 'campaigns');

// Placeholder image URLs using placehold.co service
const imageUrls = {
  'Medical': 'https://placehold.co/400x300/EF4444/FFFFFF?text=Hospital',
  'Education': 'https://placehold.co/400x300/3B82F6/FFFFFF?text=Education',
  'Health': 'https://placehold.co/400x300/F97316/FFFFFF?text=Health',
  'Environment': 'https://placehold.co/400x300/10B981/FFFFFF?text=Environment',
  'Disaster Relief': 'https://placehold.co/400x300/DC2626/FFFFFF?text=Relief',
  'Community': 'https://placehold.co/400x300/8B5CF6/FFFFFF?text=Community',
  'Other': 'https://placehold.co/400x300/6B7280/FFFFFF?text=Campaign'
};

async function updateImageUrls() {
  try {
    console.log('🔄 Updating campaign images to use online placeholders...\n');

    const campaigns = await Campaign.find({});
    let updated = 0;

    for (const campaign of campaigns) {
      const newUrl = imageUrls[campaign.category] || imageUrls['Other'];
      
      // Only update if current URL is a local file
      if (campaign.imageUrl && campaign.imageUrl.includes('/campaigns/')) {
        await Campaign.updateOne(
          { _id: campaign._id },
          { imageUrl: newUrl }
        );
        console.log(`✅ ${campaign.title}`);
        console.log(`   ${newUrl}\n`);
        updated++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updated} campaigns`);
    console.log(`   Total: ${campaigns.length} campaigns\n`);

    console.log('📸 Image URLs by category:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Object.entries(imageUrls).forEach(([category, url]) => {
      console.log(`${category}: ${url}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Database updated with real online images!');
    console.log('\n💡 These are placeholder images from placehold.co');
    console.log('   They will display immediately in all browsers\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateImageUrls();
