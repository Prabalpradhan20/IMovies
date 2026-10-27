const express = require('express');
const router = express.Router();
const {
  createShow,
  getShows,
  getShowById,
  updateShow,
  deleteShow,
} = require('../controllers/showController');
const { protect, admin } = require('../middleware/authMiddleware');

// Route for /api/shows
router
  .route('/')
  .get(getShows)
  .post(protect, admin, createShow);

// Route for /api/shows/:id
router
  .route('/:id')
  .get(getShowById)
  .put(protect, admin, updateShow)
  .delete(protect, admin, deleteShow);

module.exports = router;
