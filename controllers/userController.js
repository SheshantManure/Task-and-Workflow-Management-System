const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const User = require('../models/user/userSchema');
const { validationResult } = require('express-validator')

const SignUp = async (req, res, next) => {
    try {
        // Validating req object 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(createError(400, { message: "Validation failed", errors: errors.array() }));
        }

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
            user // contains user details except password, __v, createdAt and updatedAt
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
        // Validating req object
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(createError(400, { message: "Validation failed", errors: errors.array() }));
        }
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
            { 
              userId: user.id, 
              username: user.username,
              email: user.email,
              role: user.role
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30m' }
        );

        const refreshToken = jwt.sign(
            { 
                userId: user.id, 
                username: user.username,
                email: user.email,
                role: user.role
            },
            process.env.REFRESH_TOKEN_SECRET
        );

        // Determine if in development or production mode
        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProduction,
            maxAge: 30 * 60 * 1000 // 30 minutes expiry, in milliseconds
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
        });

        // Respond with success message
        res.status(200).json({
            status: "success",
            message: "User sign in successful"
        });

    } catch (error) {
        console.error("SignIn error: ", error.message);
        next(createError(500, "Internal Server Error"));
    }
};

module.exports = { SignUp, SignIn };