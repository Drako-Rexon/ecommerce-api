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
} = require('../controller/userCtrl');

router.post('/register', createUser);
router.put('/password', authMiddleware, updatePassword);
router.post('/forgot-password-token', forgotPasswordToken);
router.put('/reset-password/:token', resetPassword);
router.post('/login', loginUserCtrl);
router.post('/admin-login', loginAdminCtrl);
router.post('/cart', authMiddleware, userCart);
router.get('/all-users', getAllUsers);
router.get('/refresh', handleRefreshToken);
router.get('/logout', logout);
router.put('/edit-user', authMiddleware, updateUser);
router.put('/save-address', authMiddleware, saveAddress);
router.put('/block-user/:id', authMiddleware, isAdmin, blockUser);
router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUser);
router.get('/wishlist', authMiddleware, getWishlist);
router.get('/:id', authMiddleware, isAdmin, getOnlyUser);
router.delete('/:id', deleteAUser);

module.exports = router;