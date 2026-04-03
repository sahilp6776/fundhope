// SocketContext – WebSocket connection management for real-time notifications
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { io } from 'socket.io-client' // ✅ FIXED IMPORT

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const { getToken, isLoaded } = useAuth()
  const { user } = useUser()
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!isLoaded || !user) {
      setSocket(null)
      setConnected(false)
      return
    }

    let newSocket

    const connectSocket = async () => {
      try {
        const token = await getToken()

        if (!token) return

        newSocket = io(
          import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000',
          {
            auth: {
              token,
              userId: user.id,
            },
            transports: ['websocket'], // ✅ IMPORTANT (fix Vercel issues)
            reconnection: true,
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
      } catch (err) {
        console.error('Socket error:', err)
      }
    }

    connectSocket()

    return () => {
      if (newSocket) {
        newSocket.disconnect()
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
