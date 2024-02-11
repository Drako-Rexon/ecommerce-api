const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
    createUser,
    loginUserCtrl,
    getAllUsers,
    getOnlyUser,
    deleteAUser,
    updateUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    loginAdminCtrl,
    getWishlist,
    saveAddress,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getOrders,
    updateOrderStatus,
} = require('../controller/userCtrl');

router.get('/all-users', getAllUsers);
router.get('/get-orders', authMiddleware, getOrders);
router.get('/wishlist', authMiddleware, getWishlist);
router.get('/cart', authMiddleware, getUserCart);
router.get('/:id', authMiddleware, isAdmin, getOnlyUser);
router.get('/refresh', handleRefreshToken);
router.get('/logout', logout);
router.post('/register', createUser);
router.post('/forgot-password-token', forgotPasswordToken);
router.post('/login', loginUserCtrl);
router.post('/admin-login', loginAdminCtrl);
router.post('/cart', authMiddleware, userCart);
router.post('/cart/applyCoupon', authMiddleware, applyCoupon);
router.post('/cart/create-order', authMiddleware, createOrder);
router.put('/orders/update-order/:id', authMiddleware, isAdmin, updateOrderStatus);
router.put('/password', authMiddleware, updatePassword);
router.put('/edit-user', authMiddleware, updateUser);
router.put('/save-address', authMiddleware, saveAddress);
router.put('/block-user/:id', authMiddleware, isAdmin, blockUser);
router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUser);
router.put('/reset-password/:token', resetPassword);
router.delete('/empty-cart', authMiddleware, emptyCart);
router.delete('/:id', deleteAUser);

module.exports = router;