const { createCategory, updateCategory, getAllCategory, deleteCategory, getaCategory } = require("../controller/pCategoryCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const route = require("express").Router();

route.get('/', authMiddleware, isAdmin, getAllCategory);
route.get('/:id', authMiddleware, isAdmin, getaCategory);
route.post('/', authMiddleware, isAdmin, createCategory);
route.put('/:id', authMiddleware, isAdmin, updateCategory);
route.delete('/:id', authMiddleware, isAdmin, deleteCategory);

module.exports = route;