const router = require('express').Router();
const {
    createUser,
    loginUserCtrl,
    getallUsers,
    getOnlyUser,
    deleteAUser,
    updateUser,
    blockUser,
    unblockUser,
} = require('../controller/userController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

router.post('/register', createUser);
router.post('/login', loginUserCtrl);
router.get('/all-users', getallUsers);
router.get('/:id', authMiddleware, isAdmin, getOnlyUser);
router.delete('/:id', deleteAUser);
router.put('/edit-user', authMiddleware, updateUser);
router.put('/block-user/:id', authMiddleware, isAdmin, blockUser);
router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUser);

module.exports = router;