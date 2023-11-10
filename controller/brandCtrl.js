const Brand = require('../models/brandModel');
const asyncHandler = require('express-async-handler');
const validateMongoID = require('../utils/validateMongoDBID');

// * create categories
const createBrand = asyncHandler(async (req, res) => {
  try {
    const newBrand = await Brand.create(req.body);
    res.json(newBrand);
  } catch (err) {
    throw new Error(err);
  }
});

// * update categories
const updateBrand = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoID(id);
    const updateBrand = await Brand.findByIdAndUpdate(id, req.body, {
      new: true
    });
    res.json(updateBrand);
  } catch (err) {
    throw new Error(err);
  }
});

// * get categories
const getAllBrand = asyncHandler(async (req, res) => {
  try {
    const findBrand = await Brand.find();
    res.json(findBrand);
  } catch (err) {
    throw new Error(err);
  }
});

// * get a Brand
const getaBrand = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoID(id);
    const getBrand = await Brand.findById(id);
    res.json(getBrand);
  } catch (err) {
    throw new Error(err);
  }
});

// * delete categories
const deleteBrand = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoID(id);
    const deleteBrand = await Brand.findByIdAndDelete(id);
    res.json(deleteBrand);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  createBrand,
  updateBrand,
  getAllBrand,
  deleteBrand,
  getaBrand
};