const { createBrand, updateBrand, getAllBrand, deleteBrand, getaBrand } = require("../controller/brandCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const route = require("express").Router();

route.post('/', authMiddleware, isAdmin, createBrand);
route.get('/', authMiddleware, isAdmin, getAllBrand);
route.get('/:id', authMiddleware, isAdmin, getaBrand);
route.put('/:id', authMiddleware, isAdmin, updateBrand);
route.delete('/:id', authMiddleware, isAdmin, deleteBrand);

module.exports = route;