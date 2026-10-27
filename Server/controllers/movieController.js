const Movie = require('../models/Movie');

// @desc    Create a new movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res) => {
  try {
    const { title, description, genre, language, duration, releaseDate, posterUrl, rating } = req.body;

    if (!title || !description || !genre || !language || duration === undefined) {
      return res.status(400).json({
        message: 'Please provide all required fields: title, description, genre, language, and duration',
      });
    }

    const movie = await Movie.create({
      title,
      description,
      genre,
      language,
      duration,
      releaseDate,
      posterUrl,
      rating,
    });

    return res.status(201).json({
      message: 'Movie created successfully',
      movie,
    });
  } catch (error) {
    console.error('Error creating movie:', error);
    return res.status(500).json({ message: 'Server error while creating movie', error: error.message });
  }
};

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    return res.status(200).json({
      count: movies.length,
      movies,
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    return res.status(500).json({ message: 'Server error while fetching movies', error: error.message });
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    return res.status(200).json(movie);
  } catch (error) {
    console.error('Error fetching movie by ID:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Movie not found (invalid ID format)' });
    }
    return res.status(500).json({ message: 'Server error while fetching movie', error: error.message });
  }
};

// @desc    Update movie by ID
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    return res.status(200).json({
      message: 'Movie updated successfully',
      movie,
    });
  } catch (error) {
    console.error('Error updating movie:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Movie not found (invalid ID format)' });
    }
    return res.status(500).json({ message: 'Server error while updating movie', error: error.message });
  }
};

// @desc    Delete movie by ID
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    return res.status(200).json({
      message: 'Movie deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    console.error('Error deleting movie:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Movie not found (invalid ID format)' });
    }
    return res.status(500).json({ message: 'Server error while deleting movie', error: error.message });
  }
};

module.exports = {
  createMovie,
  getMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
};
