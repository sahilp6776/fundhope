const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fundhope', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import Campaign model
const Campaign = require('../models/Campaign');

async function updateApprovalDates() {
  try {
    console.log('🔄 Updating campaign approval dates...\n');
    
    const newDate = new Date('2026-01-02'); // 1/2/2026
    
    const result = await Campaign.updateMany(
      {},
      { approvedAt: newDate }
    );
    
    console.log('✅ Update Complete!\n');
    console.log('📊 Summary:');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📅 Old Date: 1/1/1970 (Unix Epoch)`);
    console.log(`📅 New Date: January 2, 2026`);
    console.log(`✅ Updated: ${result.modifiedCount} campaigns`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    // Verify the update
    const sample = await Campaign.findOne().lean();
    console.log('📝 Sample Campaign:');
    console.log(`   Title: ${sample.title}`);
    console.log(`   Approved At: ${sample.approvedAt}`);
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateApprovalDates();
