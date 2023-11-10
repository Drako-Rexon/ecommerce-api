const mongoose = require('mongoose');

const blogCategory = mongoose.Schema(
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

module.exports = mongoose.model('BCategory', blogCategory);