const router = require('express').Router();
const {
    createProduct,
    getaProduct,
    getAllProducts,
    updateProducts,
    deleteProducts,
    addToWishlist,
    rating,
    uploadImages,
} = require('../controller/productCtrl');
const {
    isAdmin,
    authMiddleware
} = require('../middlewares/authMiddleware');
const {
    uploadPhoto,
    productImageResize
} = require('../middlewares/uploadImages');

router.post('/', authMiddleware, isAdmin, createProduct);
router.put(
    '/upload/:id',
    authMiddleware,
    isAdmin,
    uploadPhoto.array('images', 10),
    productImageResize,
    uploadImages
);
router.put('/wishlist', authMiddleware, addToWishlist);
router.put('/rating', authMiddleware, rating);
router.get('/:id', getaProduct);
router.put('/:id', authMiddleware, isAdmin, updateProducts);
router.delete('/:id', authMiddleware, isAdmin, deleteProducts);
router.get('/', getAllProducts);

module.exports = router;