const Theater = require('../models/Theater');

// @desc    Create a new theater
// @route   POST /api/theaters
// @access  Private/Admin
const createTheater = async (req, res) => {
  try {
    const { name, location, screens } = req.body;

    if (!name || !location || screens === undefined) {
      return res.status(400).json({
        message: 'Please provide all required fields: name, location, and screens',
      });
    }

    const theater = await Theater.create({
      name,
      location,
      screens,
    });

    return res.status(201).json({
      message: 'Theater created successfully',
      theater,
    });
  } catch (error) {
    console.error('Error creating theater:', error);
    return res.status(500).json({ message: 'Server error while creating theater', error: error.message });
  }
};

// @desc    Get all theaters
// @route   GET /api/theaters
// @access  Public
const getTheaters = async (req, res) => {
  try {
    const theaters = await Theater.find().sort({ createdAt: -1 });
    return res.status(200).json({
      count: theaters.length,
      theaters,
    });
  } catch (error) {
    console.error('Error fetching theaters:', error);
    return res.status(500).json({ message: 'Server error while fetching theaters', error: error.message });
  }
};

// @desc    Get single theater by ID
// @route   GET /api/theaters/:id
// @access  Public
const getTheaterById = async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);

    if (!theater) {
      return res.status(404).json({ message: 'Theater not found' });
    }

    return res.status(200).json(theater);
  } catch (error) {
    console.error('Error fetching theater by ID:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Theater not found (invalid ID format)' });
    }
    return res.status(500).json({ message: 'Server error while fetching theater', error: error.message });
  }
};

// @desc    Update theater by ID
// @route   PUT /api/theaters/:id
// @access  Private/Admin
const updateTheater = async (req, res) => {
  try {
    const theater = await Theater.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!theater) {
      return res.status(404).json({ message: 'Theater not found' });
    }

    return res.status(200).json({
      message: 'Theater updated successfully',
      theater,
    });
  } catch (error) {
    console.error('Error updating theater:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Theater not found (invalid ID format)' });
    }
    return res.status(500).json({ message: 'Server error while updating theater', error: error.message });
  }
};

// @desc    Delete theater by ID
// @route   DELETE /api/theaters/:id
// @access  Private/Admin
const deleteTheater = async (req, res) => {
  try {
    const theater = await Theater.findByIdAndDelete(req.params.id);

    if (!theater) {
      return res.status(404).json({ message: 'Theater not found' });
    }

    return res.status(200).json({
      message: 'Theater deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    console.error('Error deleting theater:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Theater not found (invalid ID format)' });
    }
    return res.status(500).json({ message: 'Server error while deleting theater', error: error.message });
  }
};

module.exports = {
  createTheater,
  getTheaters,
  getTheaterById,
  updateTheater,
  deleteTheater,
};
