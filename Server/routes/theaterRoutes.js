const express = require('express');
const router = express.Router();
const {
  createTheater,
  getTheaters,
  getTheaterById,
  updateTheater,
  deleteTheater,
} = require('../controllers/theaterController');
const { protect, admin } = require('../middleware/authMiddleware');

// Route for /api/theaters
router
  .route('/')
  .get(getTheaters)
  .post(protect, admin, createTheater);

// Route for /api/theaters/:id
router
  .route('/:id')
  .get(getTheaterById)
  .put(protect, admin, updateTheater)
  .delete(protect, admin, deleteTheater);

module.exports = router;
