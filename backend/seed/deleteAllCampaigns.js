const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fundhope', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('🔄 Connecting to MongoDB...');
    console.log('✅ Connected to MongoDB');
  });

// Load Campaign model
const campaignSchema = new mongoose.Schema({}, { strict: false });
const Campaign = mongoose.model('Campaign', campaignSchema, 'campaigns');

async function deleteAllCampaigns() {
  try {
    const result = await Campaign.deleteMany({});
    
    console.log('\n📊 Deletion Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Deleted Campaigns: ${result.deletedCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (result.deletedCount > 0) {
      console.log('\n✅ ALL CAMPAIGNS REMOVED!');
    } else {
      console.log('\n⚠️ No campaigns found to delete');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting campaigns:', error.message);
    process.exit(1);
  }
}

deleteAllCampaigns();
