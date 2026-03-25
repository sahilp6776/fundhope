import React, { useState, useEffect } from 'react'
import api from '../config/api'

export default function SimpleImageTest() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/campaigns?limit=5')
      .then(res => {
        console.log('✅ API Response:', res.data.length, 'campaigns')
        res.data.forEach(c => console.log(`   ${c.title} -> ${c.imageUrl}`))
        setCampaigns(res.data)
      })
      .catch(err => console.error('❌ API Error:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-center">Loading campaigns...</div>
  if (campaigns.length === 0) return <div className="p-8 text-center text-red-600">NO CAMPAIGNS FOUND</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Simple Image Test</h1>
      <p className="text-center mb-8 text-lg">Found {campaigns.length} campaigns</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {campaigns.map((campaign) => (
          <div key={campaign._id} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-2">{campaign.title}</h2>
            <p className="text-sm text-gray-600 mb-4"><strong>URL:</strong> {campaign.imageUrl}</p>
            
            <div className="border-4 border-red-500 p-2">
              <img
                src={campaign.imageUrl}
                alt={campaign.title}
                className="w-full h-48 object-cover bg-gray-200"
                onError={(e) => {
                  console.error('❌ Image failed to load:', campaign.imageUrl)
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 100%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2214%22 fill=%22%23666%22%3EFAILED%3C/text%3E%3C/svg%3E'
                }}
                onLoad={() => console.log('✅ Image loaded:', campaign.imageUrl)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
