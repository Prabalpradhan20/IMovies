const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// Route for /api/bookings
router.post('/', protect, createBooking);

// Route for /api/bookings/my-bookings
router.get('/my-bookings', protect, getMyBookings);

module.exports = router;
