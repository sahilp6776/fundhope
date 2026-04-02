// MongoDB connection using Mongoose
const mongoose = require('mongoose')

// Connect to MongoDB
const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI

    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables")
    }

    const conn = await mongoose.connect(MONGO_URI)

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    process.exit(1)
  }
}

module.exports = { connectDB }
