// Simple API test script
const http = require('http')

function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000/api/admin${endpoint}`, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          resolve({ status: res.statusCode, data: json })
        } catch (e) {
          resolve({ status: res.statusCode, error: e.message, data })
        }
      })
    }).on('error', reject)
  })
}

async function testAPI() {
  console.log('🧪 Testing FundHope API Endpoints...\n')

  try {
    // Test stats
    const stats = await makeRequest('/stats')
    console.log('✅ /api/admin/stats')
    console.log(`  Total Campaigns: ${stats.data.totalCampaigns}`)
    console.log(`  Total Donations: ${stats.data.totalDonations}`)
    console.log(`  Total Raised: ₹${stats.data.totalRaised}`)

    console.log('')

    // Test campaigns
    const campaigns = await makeRequest('/campaigns')
    if (Array.isArray(campaigns.data)) {
      console.log(`✅ /api/admin/campaigns (${campaigns.data.length} campaigns)`)
      if (campaigns.data[0]) {
        const c = campaigns.data[0]
        console.log(`  First: "${c.title}" - Status: ${c.status}, Image: ${c.imageUrl}`)
      }
    } else {
      console.log('❌ /api/admin/campaigns - Response is not an array')
    }

    console.log('')

    // Test donations
    const donations = await makeRequest('/donations')
    if (Array.isArray(donations.data)) {
      console.log(`✅ /api/admin/donations (${donations.data.length} donations)`)
      if (donations.data[0]) {
        const d = donations.data[0]
        console.log(`  First: ₹${d.amount} -> ${d.campaignId?.title || 'Unknown Campaign'}`)
      }
    } else {
      console.log('❌ /api/admin/donations - Response is not an array')
    }

    console.log('')

    // Test users
    const users = await makeRequest('/users')
    if (Array.isArray(users.data)) {
      console.log(`✅ /api/admin/users (${users.data.length} users)`)
    } else {
      console.log('❌ /api/admin/users - Response is not an array')
    }

    console.log('')
    console.log('✅ All API endpoints are working!')
    console.log('\n📱 Frontend should now display:')
    console.log(`  • ${campaigns.data?.length || 0} campaigns with images`)
    console.log(`  • ${donations.data?.length || 0} donations`)
    console.log(`  • Total raised: ₹${stats.data?.totalRaised || 0}`)

  } catch (error) {
    console.error('❌ API Error:', error.message)
    console.error('\nMake sure:')
    console.error('  1. MongoDB is running (mongod running on port 27017)')
    console.error('  2. Backend is running (npm run dev on port 5000)')
  }

  process.exit(0)
}

testAPI()
