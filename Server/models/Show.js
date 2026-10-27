const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie ID is required'],
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theater',
      required: [true, 'Theater ID is required'],
    },
    showDate: {
      type: Date,
      required: [true, 'Show date is required'],
    },
    showTime: {
      type: String,
      required: [true, 'Show time is required (e.g. 18:00)'],
      trim: true,
    },
    screenNumber: {
      type: Number,
      required: [true, 'Screen number is required'],
    },
    price: {
      type: Number,
      required: [true, 'Ticket price is required'],
      min: [0, 'Price must be a positive number'],
    },
  },
  {
    timestamps: true,
  }
);

const Show = mongoose.model('Show', showSchema);

module.exports = Show;
