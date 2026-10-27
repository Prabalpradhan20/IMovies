const Seat = require('../models/Seat');
const Show = require('../models/Show');

// @desc    Generate seats for a show (default: 50 seats A1-E10)
// @route   POST /api/seats/generate/:showId
// @access  Public / Admin
const generateSeatsForShow = async (req, res) => {
  try {
    const { showId } = req.params;

    // Validate showId format
    if (!showId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid show ID format' });
    }

    // Check if show exists
    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    // Check if seats already generated for this show
    const existingSeats = await Seat.find({ show: showId });
    if (existingSeats.length > 0) {
      return res.status(400).json({
        message: 'Seats have already been generated for this show',
        count: existingSeats.length,
      });
    }

    // Determine row count and column count (default: 5 rows A-E, 10 columns 1-10 = 50 seats)
    const rowCount = req.body.rows && Number(req.body.rows) > 0 ? Number(req.body.rows) : 5;
    const colCount = req.body.columns && Number(req.body.columns) > 0 ? Number(req.body.columns) : 10;
    const seatPrice = req.body.price !== undefined ? req.body.price : (show.price || 0);

    const seatsToInsert = [];

    for (let r = 0; r < rowCount; r++) {
      // 0 -> 'A', 1 -> 'B', etc.
      const rowLetter = String.fromCharCode(65 + r);

      for (let c = 1; c <= colCount; c++) {
        seatsToInsert.push({
          show: showId,
          seatNumber: `${rowLetter}${c}`,
          row: rowLetter,
          number: c,
          isBooked: false,
          price: seatPrice,
        });
      }
    }

    const createdSeats = await Seat.insertMany(seatsToInsert);

    return res.status(201).json({
      message: `Successfully generated ${createdSeats.length} seats for show`,
      count: createdSeats.length,
      seats: createdSeats,
    });
  } catch (error) {
    console.error('Error generating seats:', error);
    return res.status(500).json({
      message: 'Server error while generating seats',
      error: error.message,
    });
  }
};

// @desc    Get all seats for a given show
// @route   GET /api/seats/:showId
// @access  Public
const getSeatsByShow = async (req, res) => {
  try {
    const { showId } = req.params;

    if (!showId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid show ID format' });
    }

    const seats = await Seat.find({ show: showId }).sort({ row: 1, number: 1 });

    return res.status(200).json({
      count: seats.length,
      seats,
    });
  } catch (error) {
    console.error('Error fetching seats:', error);
    return res.status(500).json({
      message: 'Server error while fetching seats',
      error: error.message,
    });
  }
};

module.exports = {
  generateSeatsForShow,
  getSeatsByShow,
};
