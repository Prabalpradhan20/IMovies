const express = require('express');
const router = express.Router();
const {
  generateSeatsForShow,
  getSeatsByShow,
} = require('../controllers/seatController');

// Route to generate seats for a specific show
router.post('/generate/:showId', generateSeatsForShow);

// Route to get all seats for a specific show
router.get('/:showId', getSeatsByShow);

module.exports = router;
