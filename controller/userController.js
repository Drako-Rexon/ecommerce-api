const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const { generateToken } = require('../config/jwtToken');
const { update } = require('../models/userModel');


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
            // res.json({
            //     message: "User Already Exists",
            //     success: false
            // });
            throw new Error("User Already Exists");
        }
    } catch (err) {
        console.log("The error occured while creating new user: ", err);
    }
});


// * login with credentials
const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // console.log(email, password);
    // * check if user exists or not
    const findUser = await User.findOne({ email });

    if (findUser && await findUser.ispPasswordMatch(password)) {
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
const getallUsers = asyncHandler(async (erq, res) => {
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
    try {

        const deleteUser = await User.findByIdAndDelete(id);
        res.json({ deleteUser });
    } catch (err) {
        throw new Error(err);
    }
});



// * update a user

const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const updatedUser = await User.findByIdAndUpdate(id, {
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


module.exports = { createUser, loginUserCtrl, getallUsers, getOnlyUser, deleteAUser, updateUser, };