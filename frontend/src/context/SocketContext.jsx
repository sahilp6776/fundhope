// SocketContext – WebSocket connection management for real-time notifications
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import io from 'socket.io-client'

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const { getToken, isLoaded } = useAuth()
  const { user } = useUser()
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    // Skip WebSocket connection if user is not authenticated
    if (!user) {
      setSocket(null)
      setConnected(false)
      return
    }

    const connectSocket = async () => {
      try {
        // Get token for authentication
        const token = await getToken()
        
        if (!token) {
          setSocket(null)
          return null
        }
        
        // Connect to WebSocket server
        const newSocket = io(
          import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000',
          {
            auth: {
              token,
              userId: user.id,
            },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
          }
        )

        newSocket.on('connect', () => {
          setConnected(true)
        })

        newSocket.on('disconnect', () => {
          setConnected(false)
        })

        setSocket(newSocket)

        // Return cleanup function
        return () => {
          newSocket.disconnect()
        }
      } catch (err) {
        console.error('Failed to connect to WebSocket:', err)
        return null
      }
    }

    let cleanup = null
    connectSocket().then((cleanupFn) => {
      cleanup = cleanupFn
    })

    return () => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    }
  }, [isLoaded, user, getToken])

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}
