const router = require('express').Router();
const { createUser, loginUserCtrl, getallUsers, getOnlyUser, deleteAUser, updateUser, } = require('../controller/userController');

router.post('/register', createUser);
router.post('/login', loginUserCtrl);
router.get('/all-users', getallUsers);
router.get('/:id', getOnlyUser);
router.delete('/:id', deleteAUser);
router.put('/:id', updateUser);

module.exports = router;