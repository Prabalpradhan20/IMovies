const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const Show = require('../models/Show');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Logged-in users)
const createBooking = async (req, res) => {
  try {
    const { showId, seatIds, totalAmount } = req.body;

    // Validate inputs
    if (!showId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0 || totalAmount === undefined) {
      return res.status(400).json({
        message: 'Please provide showId, seatIds (non-empty array), and totalAmount',
      });
    }

    // Check if the show exists
    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    // Retrieve requested seats
    const seats = await Seat.find({ _id: { $in: seatIds } });

    if (seats.length !== seatIds.length) {
      return res.status(400).json({ message: 'One or more seat IDs are invalid' });
    }

    // Check if any seat is already booked
    for (const seat of seats) {
      if (seat.status === 'booked' || seat.isBooked === true) {
        return res.status(400).json({ message: 'One or more seats are already booked.' });
      }
    }

    // Update all requested seats to booked status
    await Seat.updateMany(
      { _id: { $in: seatIds } },
      {
        $set: {
          status: 'booked',
          isBooked: true,
          lockedBy: req.user._id,
          bookedBy: req.user._id,
        },
      }
    );

    // Create the booking record
    const booking = await Booking.create({
      user: req.user._id,
      show: showId,
      seats: seatIds,
      totalAmount,
      paymentStatus: 'paid', // Mock payment
      bookingStatus: 'confirmed',
    });

    // Populate show and seat details for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: 'show',
        populate: [
          { path: 'movie', select: 'title posterUrl duration language genre' },
          { path: 'theater', select: 'name location' },
        ],
      })
      .populate('seats', 'seatNumber row number price status');

    return res.status(201).json({
      message: 'Booking confirmed successfully',
      booking: populatedBooking,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({
      message: 'Server error while creating booking',
      error: error.message,
    });
  }
};

// @desc    Get logged-in user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (Logged-in users)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: 'show',
        populate: {
          path: 'movie',
          select: 'title posterUrl duration language genre',
        },
      })
      .populate('seats', 'seatNumber row number price')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({
      message: 'Server error while fetching bookings',
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
};
