const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theater name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Theater location is required'],
      trim: true,
    },
    screens: {
      type: Number,
      required: [true, 'Number of screens is required'],
      min: [1, 'Theater must have at least 1 screen'],
    },
  },
  {
    timestamps: true,
  }
);

const Theater = mongoose.model('Theater', theaterSchema);

module.exports = Theater;
