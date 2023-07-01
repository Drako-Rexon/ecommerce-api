const router = require('express').Router();
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const {
    createUser,
    loginUserCtrl,
    getallUsers,
    getOnlyUser,
    deleteAUser,
    updateUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword,
} = require('../controller/userController');

router.post('/register', createUser);
router.put('/password', authMiddleware, updatePassword);
router.post('/login', loginUserCtrl);
router.get('/all-users', getallUsers);
router.get('/refresh', handleRefreshToken);
router.get('/logout', logout);
router.put('/edit-user', authMiddleware, updateUser);
router.put('/block-user/:id', authMiddleware, isAdmin, blockUser);
router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUser);
router.get('/:id', authMiddleware, isAdmin, getOnlyUser);
router.delete('/:id', deleteAUser);

module.exports = router;