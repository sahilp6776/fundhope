const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fundhope', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const campaignSchema = new mongoose.Schema({}, { strict: false });
const Campaign = mongoose.model('Campaign', campaignSchema, 'campaigns');

async function updateImageExtensions() {
  try {
    console.log('🔄 Updating image extensions from .jpg to .svg...\n');

    // Find all campaigns and update their imageUrl
    const campaigns = await Campaign.find({});
    let updated = 0;

    for (const campaign of campaigns) {
      if (campaign.imageUrl && campaign.imageUrl.endsWith('.jpg')) {
        const newUrl = campaign.imageUrl.replace('.jpg', '.svg');
        await Campaign.updateOne(
          { _id: campaign._id },
          { imageUrl: newUrl }
        );
        console.log(`✅ ${campaign.title}: ${campaign.imageUrl} → ${newUrl}`);
        updated++;
      }
    }

    console.log(`\n📊 Updated ${updated} campaigns`);
    
    // Verify the changes
    const updated_campaigns = await Campaign.find({}).limit(3);
    console.log('\n📝 Sample of updated records:');
    updated_campaigns.forEach(c => {
      console.log(`  ${c.title} → ${c.imageUrl}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateImageExtensions();
