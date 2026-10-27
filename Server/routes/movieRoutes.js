const express = require('express');
const router = express.Router();
const {
  createMovie,
  getMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
} = require('../controllers/movieController');
const { protect, admin } = require('../middleware/authMiddleware');

// Route for /api/movies
router
  .route('/')
  .get(getMovies)
  .post(protect, admin, createMovie);

// Route for /api/movies/:id
router
  .route('/:id')
  .get(getMovieById)
  .put(protect, admin, updateMovie)
  .delete(protect, admin, deleteMovie);

module.exports = router;
