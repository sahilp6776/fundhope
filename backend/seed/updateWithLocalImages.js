const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fundhope', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import Campaign model
const Campaign = require('../models/Campaign');

// Map campaigns to local image files
const campaignImageMap = {
  'Medical Equipment for Rural Hospital': '/campaigns/medical_rural_hospital.jpg',
  'Education Scholarships for Underprivileged': '/campaigns/education_scholarships.jpg',
  'Solar Power for Rural Village': '/campaigns/reforestation_project.jpg', // Using closest match
  'Clean Drinking Water Project': '/campaigns/clean drinking water.jpeg',
  'Emergency Flood Relief Campaign': '/campaigns/flood_relief.jpg',
  'Free Medical Camp for Rural Area': '/campaigns/medical_camp.jpg',
  'Ambulance Service for Remote Communities': '/campaigns/ambulance_service.jpg',
  'Women Skill Development Center': '/campaigns/women_skill_center.jpg',
  'Support Farmers After Crop Loss': '/campaigns/farmers_support.jpg',
  'Food Support for Homeless Families': '/campaigns/food_charity.jpg',
  'Child Heart Surgery Support Fund': '/campaigns/child_surgery_support.jpg',
  'Animal Shelter Construction': '/campaigns/animal_shelter.jpg',
  'Rebuild Homes After Cyclone Disaster': '/campaigns/cyclone_rebuild.jpg',
  'Wheelchairs and Mobility Aids': '/campaigns/wheelchair_support.jpg',
  'School Construction in Remote Area': '/campaigns/Build a School in Rural India.jpg',
  'Eye Camp and Vision Correction': '/campaigns/eye_camp.jpg',
  'Micro-Finance for Women Entrepreneurs': '/campaigns/women_microfinance.jpg',
  'Reforestation Project - Plant Trees': '/campaigns/reforestation_project.jpg',
  'Mental Health Awareness Campaign': '/campaigns/mental_health_campaign.jpg',
  'Earthquake Rehabilitation Support': '/campaigns/earthquake rehabiliatation.jpg'
};

async function updateCampaignImages() {
  try {
    console.log('🖼️  Updating campaigns with local image files...\n');
    
    let updated = 0;
    let notFound = 0;
    
    for (const [title, imagePath] of Object.entries(campaignImageMap)) {
      const campaign = await Campaign.findOne({ title });
      
      if (campaign) {
        await Campaign.updateOne({ _id: campaign._id }, { imageUrl: imagePath });
        console.log(`✅ ${title}`);
        console.log(`   📷 ${imagePath}\n`);
        updated++;
      } else {
        console.log(`⚠️  Campaign not found: ${title}\n`);
        notFound++;
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Updated: ${updated} campaigns`);
    console.log(`⚠️  Not found: ${notFound} campaigns`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📂 Images are now stored in: frontend/public/campaigns/');
    console.log('🌐 Access via: /campaigns/image_name.jpg\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateCampaignImages();
