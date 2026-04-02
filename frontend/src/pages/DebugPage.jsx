import React, { useState, useEffect } from 'react'
import api from '../config/api'

export default function DebugPage() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await api.get('/campaigns?limit=3')
        console.log('API Response:', response.data)
        setCampaigns(response.data)
      } catch (err) {
        console.error('Fetch error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-6">Debug: Campaign Images</h1>
      
      {campaigns.length === 0 ? (
        <p className="text-red-600 text-lg">❌ NO CAMPAIGNS FOUND</p>
      ) : (
        <div className="space-y-8">
          <p className="text-green-600 text-lg">✅ Found {campaigns.length} campaigns</p>
          
          {campaigns.map((campaign) => (
            <div key={campaign._id} className="border-2 border-gray-300 p-6 rounded">
              <h2 className="text-xl font-bold mb-2">{campaign.title}</h2>
              
              <div className="space-y-2 mb-4 bg-gray-100 p-4 rounded font-mono text-sm">
                <p><strong>_id:</strong> {campaign._id}</p>
                <p><strong>imageUrl:</strong> {campaign.imageUrl}</p>
                <p><strong>category:</strong> {campaign.category}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="font-semibold mb-2">Image Test #1 - Direct URL:</p>
                  <p className="text-sm text-gray-600 mb-2">http://localhost:3000{campaign.imageUrl}</p>
                  <img 
                    src={`http://localhost:3000${campaign.imageUrl}`}
                    alt={campaign.title}
                    className="w-full max-w-xs h-48 object-cover border-2 border-red-500"
                    onError={(e) => {
                      console.error('Image load error - Direct URL:', campaign.imageUrl)
                      e.target.style.border = '2px solid red'
                    }}
                    onLoad={() => console.log('✅ Image loaded:', campaign.imageUrl)}
                  />
                </div>

                <div>
                  <p className="font-semibold mb-2">Image Test #2 - Relative URL:</p>
                  <p className="text-sm text-gray-600 mb-2">{campaign.imageUrl}</p>
                  <img 
                    src={campaign.imageUrl}
                    alt={campaign.title}
                    className="w-full max-w-xs h-48 object-cover border-2 border-blue-500"
                    onError={(e) => {
                      console.error('Image load error - Relative URL:', campaign.imageUrl)
                      e.target.style.border = '2px solid red'
                    }}
                    onLoad={() => console.log('✅ Image loaded:', campaign.imageUrl)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
