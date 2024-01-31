const router = require('express').Router();
const {
    createProduct,
    getaProduct,
    getAllProducts,
    updateProducts,
    deleteProducts,
    addToWishlist,
    rating,
} = require('../controller/productCtrl');
const {
    isAdmin,
    authMiddleware
} = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, isAdmin, createProduct);
router.put('/wishlist', authMiddleware, addToWishlist);
router.put('/rating', authMiddleware, rating);
router.get('/:id', getaProduct);
router.put('/:id', authMiddleware, isAdmin, updateProducts);
router.delete('/:id', authMiddleware, isAdmin, deleteProducts);
router.get('/', getAllProducts);

module.exports = router;