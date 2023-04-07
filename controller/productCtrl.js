const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const createProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const newProduct = await Product.create(req.body);
        res.json(newProduct);
    } catch (err) {
        throw new Error(err);
    }
});

const updateProducts = asyncHandler(async (req, res) => {
    const id = req.params;
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const updateProduct = await Product.findOneAndUpdate({ id }, req.body, { new: true });
        res.json(updateProduct);
    } catch (err) {
        throw new Error(err);
    }
});


const deleteProducts = asyncHandler(async (req, res) => {
    const id = req.params;
    try {
        const deleteProduct = await Product.findOneAndDelete(id);
        res.json(deleteProduct);
    } catch (err) {
        throw new Error(err);
    }
});

const getaProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const findProduct = await Product.findById(id);
        res.json(findProduct);
    } catch (err) {
        throw new Error(err);
    }
});

const getAllProducts = asyncHandler(async (req, res) => {
    try {
        // const queryObj = 

        console.log(req.query);
        const getAllProduct = await Product.find({
            brand: req.query.brand,
            category: req.query.category,
        });
        res.json(getAllProduct);
    } catch (err) {
        throw new Error(err);
    }
});

module.exports = {
    createProduct,
    getaProduct,
    getAllProducts,
    updateProducts,
    deleteProducts
};