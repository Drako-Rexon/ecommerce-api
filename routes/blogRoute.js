const express = require('express');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();
const { createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, likeBlog, dislikeBlog } = require('../controller/blogCtrl');

router.get('/:id', getBlog);
router.get('/', getAllBlogs);
router.put('/likes', authMiddleware, likeBlog);
router.put('/dislikes', authMiddleware, dislikeBlog);
router.post('/', authMiddleware, isAdmin, createBlog);
router.put('/:id', authMiddleware, isAdmin, updateBlog);
router.delete('/:id', authMiddleware, isAdmin, deleteBlog);

module.exports = router;