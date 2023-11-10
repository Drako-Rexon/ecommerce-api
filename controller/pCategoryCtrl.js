const ProductCategory = require('../models/productCategoryModel');
const asyncHandler = require('express-async-handler');
const validateMongoID = require('../utils/validateMongoDBID');

// * create categories
const createCategory = asyncHandler(async (req, res) => {
  try {
    const newCategory = await ProductCategory.create(req.body);
    res.json(newCategory);
  } catch (err) {
    throw new Error(err);
  }
});

// * update categories
const updateCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoID(id);
    const updateCategory = await ProductCategory.findByIdAndUpdate(id, req.body, {
      new: true
    });
    res.json(updateCategory);
  } catch (err) {
    throw new Error(err);
  }
});

// * get categories
const getAllCategory = asyncHandler(async (req, res) => {
  try {
    const findCategory = await ProductCategory.find();
    res.json(findCategory);
  } catch (err) {
    throw new Error(err);
  }
});

// * get a category
const getaCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoID(id);
    const getCategory = await ProductCategory.findById(id);
    res.json(getCategory);
  } catch (err) {
    throw new Error(err);
  }
});

// * delete categories
const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoID(id);
    const deleteCategory = await ProductCategory.findByIdAndDelete(id);
    res.json(deleteCategory);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  createCategory,
  updateCategory,
  getAllCategory,
  deleteCategory,
  getaCategory
};