const Show = require('../models/Show');

// @desc    Create a new show
// @route   POST /api/shows
// @access  Private/Admin
const createShow = async (req, res) => {
  try {
    const { movie, theater, showDate, showTime, screenNumber, price } = req.body;

    if (!movie || !theater || !showDate || !showTime || screenNumber === undefined || price === undefined) {
      return res.status(400).json({
        message: 'Please provide all required fields: movie, theater, showDate, showTime, screenNumber, and price',
      });
    }

    const show = await Show.create({
      movie,
      theater,
      showDate,
      showTime,
      screenNumber,
      price,
    });

    const populatedShow = await Show.findById(show._id)
      .populate('movie', 'title')
      .populate('theater', 'name');

    return res.status(201).json({
      message: 'Show created successfully',
      show: populatedShow,
    });
  } catch (error) {
    console.error('Error creating show:', error);
    return res.status(500).json({ message: 'Server error while creating show', error: error.message });
  }
};

// @desc    Get all shows (populated with Movie title and Theater name)
// @route   GET /api/shows
// @access  Public
const getShows = async (req, res) => {
  try {
    const shows = await Show.find()
      .populate('movie', 'title')
      .populate('theater', 'name')
      .sort({ showDate: 1, showTime: 1 });

    return res.status(200).json({
      count: shows.length,
      shows,
    });
  } catch (error) {
    console.error('Error fetching shows:', error);
    return res.status(500).json({ message: 'Server error while fetching shows', error: error.message });
  }
};

// @desc    Get single show by ID
// @route   GET /api/shows/:id
// @access  Public
const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie', 'title')
      .populate('theater', 'name');

    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    return res.status(200).json(show);
  } catch (error) {
    console.error('Error fetching show by ID:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Show not found (invalid ID format)' });
    }
    return res.status(500).json({ message: 'Server error while fetching show', error: error.message });
  }
};

// @desc    Update show by ID
// @route   PUT /api/shows/:id
// @access  Private/Admin
const updateShow = async (req, res) => {
  try {
    const show = await Show.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('movie', 'title')
      .populate('theater', 'name');

    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    return res.status(200).json({
      message: 'Show updated successfully',
      show,
    });
  } catch (error) {
    console.error('Error updating show:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Show not found (invalid ID format)' });
    }
    return res.status(500).json({ message: 'Server error while updating show', error: error.message });
  }
};

// @desc    Delete show by ID
// @route   DELETE /api/shows/:id
// @access  Private/Admin
const deleteShow = async (req, res) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);

    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    return res.status(200).json({
      message: 'Show deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    console.error('Error deleting show:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Show not found (invalid ID format)' });
    }
    return res.status(500).json({ message: 'Server error while deleting show', error: error.message });
  }
};

module.exports = {
  createShow,
  getShows,
  getShowById,
  updateShow,
  deleteShow,
};
