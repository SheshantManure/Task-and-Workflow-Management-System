const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const User = require('../models/user/userSchema');

const SignUp = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;
        // Check for missing fields
        if (!username || !email || !password || !role) {
            return next(createError(400, "Missing required fields"));
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user in the database
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role
        });

        const { password: _, __v, createdAt, updatedAt, ...user } = newUser._doc; 
        res.status(201).json({
            message: "User successfully signed up",
            user // contains user details except password
        });

    } catch (error) {
        // Handle specific error if unique constraint is violated (e.g., duplicate email)
        if (error.code === 11000) {
            return next(createError(409, "Email already exists"));
        }
        next(createError(500, "Internal Server Error"));
    }
};

const SignIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(createError(400, "Missing required fields"));
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return next(createError(404, "Incorrect email or password"));
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(createError(401, "Incorrect email or password"));
        }

        const accessToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.REFRESH_TOKEN_SECRET
        );

        res.json({
            accessToken,
            refreshToken,
            message: "User sign in successful"
        });

    } catch (error) {
        console.error("SignIn error: ", error.message);
        next(createError(500, "Internal Server Error"));
    }
};

module.exports = { SignUp, SignIn };