// MongoDB connection using Mongoose
const mongoose = require('mongoose')

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI = mongodb+srv://fundhope_user:fundhope123@fundhope.8eyygmx.mongodb.net/fundhope?retryWrites=true&w=majority')
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    process.exit(1)
  }
}

module.exports = { connectDB }
