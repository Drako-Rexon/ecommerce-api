const Coupon = require('../models/couponModel');
const asyncHandler = require('express-async-handler');
const validateMongoID = require('../utils/validateMongoDBID');

const createCoupon = asyncHandler(async (req, res) => {
  try {
    const newCoupon = await Coupon.create(req.body);
    res.json(newCoupon);
  } catch (err) {
    throw new Error(err);
  }
});

const getAllCoupon = asyncHandler(async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (err) {
    throw new Error(err);
  }
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const updateCoupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updateCoupon);
  } catch (err) {
    throw new Error(err);
  }
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const updateCoupon = await Coupon.findByIdAndDelete(id);
    res.json(updateCoupon);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  createCoupon,
  getAllCoupon,
  updateCoupon,
  deleteCoupon
};