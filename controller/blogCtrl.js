const Blog = require('../models/blogModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const validateMongoId = require('../utils/validateMongoDBID');

// * create new blogs
const createBlog = asyncHandler(async (req, res) => {
    try {
        const newBlog = await Blog.create(req.body);
        res.json(newBlog);
    } catch (err) {
        throw new Error(err);
    }
});

// * update the blog
const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoId(id);
    try {
        const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        res.json(updateBlog);
    } catch (err) {
        throw new Error(err);
    }
});

// * get blog
const getBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoId(id);
    try {
        const getBlog = await Blog.findById(id).populate("likes").populate("disLikes");
        await Blog.findByIdAndUpdate(id,
            { $inc: { numViews: 1 } },
            { new: true }
        );
        res.json(getBlog);
    } catch (err) {
        throw new Error(err);
    }
});

// * get all blogs
const getAllBlogs = asyncHandler(async (req, res) => {
    try {
        const getBlogs = await Blog.find();
        res.json(getBlogs);
    } catch (err) {
        throw new Error(err);
    }
});

// * delete a blog
const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoId(id);
    try {
        const deletedBlog = await Blog.findByIdAndDelete(id);
        res.json(deletedBlog);
    } catch (err) {
        throw new Error(err);
    }
});

// * like a blog
const likeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongoId(blogId);

    const blog = await Blog.findById(blogId);
    // ? find the login user
    const loginUserId = req?.user?._id;

    // ? find if the user has liked the blog?
    const isLiked = blog?.isLiked;
    // ? find if the user has disliked the blog
    const alreadyDisliked = blog?.disLikes?.find((userId) => userId?.toString() === loginUserId?.toString());

    if (alreadyDisliked) {
        const blog = await Blog.findByIdAndUpdate(blogId,
            { $pull: { disLikes: loginUserId }, isDisliked: false, },
            { new: true });
        res.json(blog);
    }

    if (isLiked) {
        const blog = await Blog.findByIdAndUpdate(blogId,
            { $pull: { likes: loginUserId }, isLiked: false, },
            { new: true });
        res.json(blog);
    } else {
        const blog = await Blog.findByIdAndUpdate(blogId,
            { $push: { likes: loginUserId }, isLiked: true, },
            { new: true });
        res.json(blog);
    }
});


// * dislike a blog
const dislikeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongoId(blogId);

    const blog = await Blog.findById(blogId);
    // ? find the login user
    const loginUserId = req?.user?._id;

    // ? find if the user has liked the blog?
    const isDisliked = blog?.isDisliked;
    // ? find if the user has disliked the blog
    const alreadyLiked = blog?.likes?.find((userId) => userId?.toString() === loginUserId?.toString());

    if (alreadyLiked) {
        const blog = await Blog.findByIdAndUpdate(blogId,
            { $pull: { likes: loginUserId }, isLiked: false, },
            { new: true });
        res.json(blog);
    }

    if (isDisliked) {
        const blog = await Blog.findByIdAndUpdate(blogId,
            { $pull: { disLikes: loginUserId }, isDisliked: false, },
            { new: true });
        res.json(blog);
    } else {
        const blog = await Blog.findByIdAndUpdate(blogId,
            { $push: { disLikes: loginUserId }, isDisliked: true, },
            { new: true });
        res.json(blog);
    }
});

module.exports = {
    createBlog,
    updateBlog,
    getBlog,
    getAllBlogs,
    deleteBlog,
    likeBlog,
    dislikeBlog,
};