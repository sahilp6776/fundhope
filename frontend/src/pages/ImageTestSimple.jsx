import React, { useState, useEffect } from 'react'

export default function ImageTestSimple() {
  const [status, setStatus] = useState('Loading...')

  useEffect(() => {
    // Test 1: Can we access the image file directly?
    const testDirect = async () => {
      try {
        const response = await fetch('http://localhost:3000/campaigns/hospital.jpg')
        console.log('Direct fetch status:', response.status)
      } catch (err) {
        console.error('Direct fetch error:', err)
      }
    }

    // Test 2: Can we load an image with img tag?
    const img = new Image()
    img.onload = () => {
      console.log('✅ Image loaded successfully via Image()')
      setStatus('✅ Image can load success')
    }
    img.onerror = () => {
      console.error('❌ Image failed to load')
      setStatus('❌ Image failed to load')
    }
    img.src = '/campaigns/hospital.jpg'

    testDirect()
  }, [])

  return (
    <div style={{ padding: '40px', background: '#f0f0f0', minHeight: '100vh' }}>
      <h1>Image Test - Direct Rendering</h1>
      <p>Status: {status}</p>

      <div style={{ marginTop: '20px', border: '3px solid red', padding: '10px' }}>
        <p>Test Image (red border):</p>
        <img
          src="/campaigns/hospital.jpg"
          alt="test"
          style={{ width: '200px', height: '150px', border: '2px solid blue' }}
          onLoad={() => console.log('✅ img tag loaded')}
          onError={() => console.error('❌ img tag error')}
        />
      </div>

      <div style={{ marginTop: '20px', border: '3px solid green', padding: '10px' }}>
        <p>Test Image 2 (green border):</p>
        <img
          src="/campaigns/relief.jpg"
          alt="test2"
          style={{ width: '200px', height: '150px', border: '2px solid orange' }}
          onLoad={() => console.log('✅ img tag 2 loaded')}
          onError={() => console.error('❌ img tag 2 error')}
        />
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>Diagnostics:</h2>
        <p>Check the browser console (F12) for:
          <ul>
            <li>✅ marks if images load</li>
            <li>❌ marks if images fail</li>
            <li>Network requests to /campaigns/*.jpg</li>
          </ul>
        </p>
      </div>
    </div>
  )
}
