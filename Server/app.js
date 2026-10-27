// ==========================================
// 1. Module Imports
// ==========================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const theaterRoutes = require('./routes/theaterRoutes');
const showRoutes = require('./routes/showRoutes');
const seatRoutes = require('./routes/seatRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// ==========================================
// 2. Environment Configuration & App Initialization
// ==========================================
// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// Set server port from environment or fallback to 3000
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// ==========================================
// 3. Middleware Configuration
// ==========================================
// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Parse incoming requests with JSON payloads
app.use(express.json());

// ==========================================
// 4. Routes
// ==========================================
// Health-check route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'IMovies API is running successfully'
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Movie routes
app.use('/api/movies', movieRoutes);

// Theater routes
app.use('/api/theaters', theaterRoutes);

// Show routes
app.use('/api/shows', showRoutes);

// Seat routes
app.use('/api/seats', seatRoutes);

// Booking routes
app.use('/api/bookings', bookingRoutes);

// ==========================================
// 5. Database Connection & Server Startup
// ==========================================
const startServer = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI is missing from environment variables (.env file).');
    }

    // Connect to MongoDB Atlas
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('Successfully connected to MongoDB Atlas.');

    // Start listening only after the database connection is established
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB Atlas:', error.message);
    // Exit process with failure code if database connection fails
    process.exit(1);
  }
};

// Start the server
startServer();
