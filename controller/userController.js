const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const { generateToken } = require('../config/jwtToken');
const validateMongoId = require('../utils/validateMongoDBID');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const sendEmail = require('./emailController');
const crypto = require('crypto');

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
};