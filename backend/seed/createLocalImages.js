const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Simple 1x1 transparent PNG (minimal valid PNG file)
const createMinimalPNG = () => {
  return Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
    0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
};

// Campaign image mappings
const campaignImages = {
  'Medical Equipment for Rural Hospital': 'medical_rural_hospital.jpg',
  'Education Scholarships for Underprivileged': 'education_scholarships.jpg',
  'Solar Power for Rural Village': 'solar_rural_village.jpg',
  'Clean Drinking Water Project': 'clean_water_project.jpg',
  'Emergency Flood Relief Campaign': 'flood_relief.jpg',
  'Free Medical Camp for Rural Area': 'medical_camp.jpg',
  'Ambulance Service for Remote Communities': 'ambulance_service.jpg',
  'Women Skill Development Center': 'women_skills.jpg',
  'Support Farmers After Crop Loss': 'farmers_support.jpg',
  'Food Support for Homeless Families': 'food_support.jpg',
  'Child Heart Surgery Support Fund': 'heart_surgery.jpg',
  'Animal Shelter Construction': 'animal_shelter.jpg',
  'Rebuild Homes After Cyclone Disaster': 'cyclone_relief.jpg',
  'Wheelchairs and Mobility Aids': 'wheelchairs.jpg',
  'School Construction in Remote Area': 'school_construction.jpg',
  'Eye Camp and Vision Correction': 'eye_camp.jpg',
  'Micro-Finance for Women Entrepreneurs': 'microfinance.jpg',
  'Reforestation Project - Plant Trees': 'reforestation.jpg',
  'Mental Health Awareness Campaign': 'mental_health.jpg',
  'Earthquake Rehabilitation Support': 'earthquake_relief.jpg'
};

async function createImagesAndUpdateDB() {
  try {
    const campaignsDir = path.join(__dirname, '../frontend/public/campaigns');
    
    // Ensure directory exists
    if (!fs.existsSync(campaignsDir)) {
      fs.mkdirSync(campaignsDir, { recursive: true });
    }
    
    console.log('📁 Creating image files in:', campaignsDir);
    console.log('');
    
    // Create image files
    const pngBuffer = createMinimalPNG();
    let createdCount = 0;
    
    for (const [campaignName, imageName] of Object.entries(campaignImages)) {
      const imagePath = path.join(campaignsDir, imageName);
      fs.writeFileSync(imagePath, pngBuffer);
      console.log(`✅ Created: ${imageName}`);
      createdCount++;
    }
    
    console.log('');
    console.log(`✅ Created ${createdCount} image files`);
    console.log('');
    
    // Connect to MongoDB and update campaigns
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fundhope', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    const Campaign = require('../backend/models/Campaign');
    
    console.log('🔄 Updating campaign image paths in database...');
    console.log('');
    
    let updated = 0;
    for (const [campaignTitle, imageName] of Object.entries(campaignImages)) {
      const imageUrl = `/campaigns/${imageName}`;
      
      const result = await Campaign.updateOne(
        { title: campaignTitle },
        { imageUrl }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated: ${campaignTitle}`);
        console.log(`   📷 ${imageUrl}`);
        updated++;
      }
    }
    
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Updated ${updated} campaigns`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📝 All campaigns now use local image paths:');
    console.log('   /campaigns/medical_rural_hospital.jpg');
    console.log('   /campaigns/education_scholarships.jpg');
    console.log('   ...and more\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createImagesAndUpdateDB();
