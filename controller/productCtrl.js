const Product = require('../models/productModel');
const User = require('../models/userModel');
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

        // filtering
        const queryObj = { ...req.query };
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach((ele) => delete queryObj[ele]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        let query = Product.find(JSON.parse(queryStr));

        // * sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query.sort('-createdAt');
        }

        // * limiting the fields
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select("-__v");
        }

        // * pagination
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        // console.log(page, limit, skip);
        query = query.skip(skip).limit(limit);
        if (req.query.page) {

            const productCount = await Product.countDocuments();
            if (skip >= productCount) throw new Error("This page doesn't exist");
        }

        const product = await query;
        res.json(product);
    } catch (err) {
        throw new Error(err);
    }
});

const addToWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { productId } = req.body;
    try {
        const user = await User.findById(_id);
        const alreadyAdded = user.wishlist.find((id) => id.toString() === productId);
        if (alreadyAdded) {
            let user = await User.findByIdAndUpdate(_id, {
                $pull: { wishlist: productId }
            }, { new: true });
            return res.json(user);
        } else {
            let user = await User.findByIdAndUpdate(_id, {
                $push: { wishlist: productId }
            }, { new: true });
            return res.json(user);
        }
    } catch (err) {
        throw new Error(err);
    }
});

const rating = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { star, productId, comment } = req.body;

    try {
        const product = await Product.findById(productId);
        // console.log(product.ratings.find((data) => data._id));
        let alreadyRated = product.ratings.find(
            (userId) => userId.postedby.toString() === _id.toString()
        );

        if (alreadyRated) {
            const updateRating = await Product.updateOne(
                { ratings: { $elemMatch: alreadyRated }, },
                { $set: { "ratings.$.star": star, "ratings.$.comment": comment } },
                { new: true }
            );
        } else {
            const rateProduct = await Product.findByIdAndUpdate(
                productId,
                {
                    $push: {
                        ratings: {
                            star: star, comment: comment,
                            postedby: _id
                        }
                    }
                },
                {
                    new: true
                }
            );
        }

        const getAllRatings = await Product.findById(productId);
        let totalRating = getAllRatings.ratings.length;
        let ratingSum = getAllRatings.ratings.map((item) => item.star).reduce((prev, curr) => prev + curr, 0);
        let actualRating = Math.round(ratingSum / totalRating);
        let finalproduct = await Product.findByIdAndUpdate(productId, {
            totalRating: actualRating
        }, { new: true });

        res.json(finalproduct);
    } catch (err) {
        throw new Error(err);
    }
})

module.exports = {
    createProduct,
    getaProduct,
    getAllProducts,
    updateProducts,
    deleteProducts,
    addToWishlist,
    rating,
};