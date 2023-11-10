const mongoose = require('mongoose');

const brandScema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Brand', brandScema);