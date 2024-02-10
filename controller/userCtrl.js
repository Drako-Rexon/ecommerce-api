const User = require('../models/userModel');
const Product = require('../models/productModel');
const Coupon = require('../models/couponModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');

const asyncHandler = require('express-async-handler');
const { generateToken } = require('../config/jwtToken');
const validateMongoId = require('../utils/validateMongoDBID');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const sendEmail = require('./emailController');
const crypto = require('crypto');
const uniqid = require('uniqid');

// * create new user
const createUser = asyncHandler(async (req, res) => {
  try {
    const ema = req.body.email;
    const findUser = await User.findOne({ email: ema });

    if (!findUser) {
      // * create new user
      const newUser = await User.create(req.body);
      res.status(201).send({ status: 201, message: "User has registered successfully", data: newUser });
    } else {
      // * user already exists
      throw new Error("User Already Exists");
    }
  } catch (err) {
    console.log("The error occured while creating new user: ", err);
  }
});


// * login with credentials
const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // * check if user exists or not
  const findUser = await User.findOne({ email });

  if (findUser && await findUser.ispPasswordMatch(password)) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(findUser.id,
      { refreshToken: refreshToken }, { new: true });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    })
    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id)
    });
  } else {
    throw new Error("Invalid credentials");
  }
});


//* login asdmin
const loginAdminCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // * check if user exists or not
  const findAdmin = await User.findOne({ email });
  if (findAdmin.role !== 'admin') throw new Error('Not Authorised');
  if (findAdmin && await findAdmin.ispPasswordMatch(password)) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateUser = await User.findByIdAndUpdate(findAdmin.id,
      { refreshToken: refreshToken }, { new: true });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    })
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?._id)
    });
  } else {
    throw new Error("Invalid credentials");
  }
});


// * Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (err) {
    throw new Error(err);
  }
});


// * find a single user
const getOnlyUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // console.log(id);
  validateMongoId(id);
  try {

    const getaUser = await User.findById(id);
    res.json({ getaUser });
  } catch (err) {
    throw new Error(err);
  }
});

// * delete a user
const deleteAUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // console.log(id);
  validateMongoId(id);
  try {

    const deleteUser = await User.findByIdAndDelete(id);
    res.json({ deleteUser });
  } catch (err) {
    throw new Error(err);
  }
});

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("no Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  console.log(refreshToken);
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error("Ni Refresh token present in DB or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    console.log(decoded);
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateRefreshToken(user?._id);
    res.json({ accessToken });
  });

});


// * user logout fucntionality

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error('No Refresh Token in Cookies');
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true
    });
    return res.sendStatus(204); // logout
  }

  await User.findOneAndUpdate(refreshToken, {
    refreshToken: ""
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true
  });
  return res.sendStatus(204); // logout
});

// * update a user

const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoId(_id);
  try {
    const updatedUser = await User.findByIdAndUpdate(_id, {
      firstname: req?.body?.firstname,
      lastname: req?.body?.lastname,
      email: req?.body?.email,
      mobile: req?.body?.mobile,
    }, { new: true });
    res.json(updatedUser);

  } catch (err) {
    throw new Error(err);
  }
});

// * block a user
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params
  validateMongoId(id);
  try {
    const block = await User.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    );

    res.json({
      message: "User Blocked"
    })
  } catch (err) {
    throw new Error(err);
  }
});

// * unblock a user
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params
  validateMongoId(id);
  try {
    const block = await User.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    );

    res.json({
      message: "User Unblocked"
    })
  } catch (err) {
    throw new Error(err);
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatePassword = await user.save();
    res.json(updatePassword);
  } else {
    res.json(user);
  }
});

// * generating reset token for forgetting password
const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  console.log(user);

  if (!user) throw new Error("User not found with the email");
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetUrl = `Hi! Please follow this link to reset your password. This link is valid till 10 minutes from now. <a href="localhost:3000/api/users/reset-password/${token}">Click Here</a>`;
    const data = {
      to: email,
      text: "Hi User",
      subject: "Forgot Password Link",
      html: resetUrl
    };
    sendEmail(data);
    res.json(token);

  } catch (error) {
    throw new Error(error)
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error('Token Expired, PLease try again later');

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  res.json(user);

});

const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoId(_id);
  try {
    const findUser = await User.findById(_id.toString());
    res.json(findUser);
  } catch (err) {
    throw new Error(err);
  }
});

const saveAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoId(_id);
  try {
    const updatedUser = await User.findByIdAndUpdate(_id, {
      address: req?.body?.address,
    }, {
      new: true
    });
    res.json(updatedUser);
  } catch (err) {
    throw new Error(err);
  }
});


const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoId(_id);
  try {
    let products = [];
    const user = await User.findById(_id);
    const alreadyExistCart = await Cart.findOne({ orderby: user._id });

    if (alreadyExistCart) {
      alreadyExistCart.remove();
    }

    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;
      let getPrice = await Product.findById(cart[i]._id).select('price').exec();
      object.price = getPrice.price;
      products.push(object);
    }

    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count;
    }

    let newCart = await Cart({
      products,
      cartTotal,
      orderby: user?._id,
    }).save();
    res.json(newCart);

  } catch (err) {
    throw new Error(err);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoId(_id);
  try {
    const cart = await Cart.findOne({ orderby: _id })
    // .populate("products.product");
    res.json(cart);
  } catch (err) {
    throw new Error(err);
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoId(_id);
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.findOneAndRemove({ orderby: user?._id });
    res.json(cart);
  } catch (err) {
    throw new Error(err);
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  validateMongoId(_id);
  try {
    const validCoupon = await Coupon.findOne({ name: coupon });
    if (validCoupon == null) {
      throw new Error("Invalid Coupon");
    }
    const user = await User.findOne({ _id });
    let { cartTotal } = await Cart.findOne({
      orderby: user?._id
    })
    // .populate("products.product");
    let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount) / 100)
      .toFixed(2);
    await Cart.findOneAndUpdate(
      { orderby: user?._id },
      { totalAfterDiscount },
      { new: true }
    );

    res.json(totalAfterDiscount);
  } catch (err) {
    throw new Error(err);
  }
});

const createOrder = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoId(_id);
  const { COD, couponApplied } = req.body;
  try {
    if (!COD) throw new Error("Create cash order failed");
    const user = await User.findById(_id);
    let userCart = await Cart.findOne({ orderby: user?._id });
    let finalAmount = 0;
    if (couponApplied && userCart.totalAfterDiscount) {
      finalAmount = userCart.totalAfterDiscount;
    } else {
      finalAmount = userCart.cartTotal;
    }

    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: "COD",
        amount: finalAmount,
        status: "Cash on Delivery",
        created: Date.now(),
        currentcy: "usd"
      },
      orderby: user?._id,
      orderStatus: "Cash on Delivery"
    }).save();
    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product_id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        }
      }
    });
    const updated = await Product.bulkWrite(update, {});
    res.json({ message: "success" });
  } catch (err) {
    throw new Error(err);
  }
});

const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoId(_id);
  try {
    const userOrders = await Order.findOne({ orderby: _id })
      // .populate('products.product')
      .exec();
    res.json(userOrders);
  } catch (err) {
    throw new Error(err);
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMongoId(id);
  const updateOrder = await Order.findByIdAndUpdate(id, {
    orderStatus: status,
    paymentIntent: {
      status: status,
    }
  }, { new: true });
  res.json(updateOrder);
});

module.exports = {
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
};