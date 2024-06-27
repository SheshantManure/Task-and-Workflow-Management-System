const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const User = require('../models/user/userSchema');

const authenticate = async (req, res, next) => {
    try {
        const { accesstoken: accessToken, refershtoken: refreshToken } = req.headers;
        if (!accessToken) {
            return next(createError(401, "Access token is required"));
        }

        // Verifying the access token
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                // If the access token has expired and there's a refresh token
                if (err.name === 'TokenExpiredError' && refreshToken) {
                    const newTokens = await refreshTokens(refreshToken);
                    if (newTokens) {
                        res.set('Access-Control-Expose-Headers', 'x-access-token, x-refresh-token');
                        res.set('x-access-token', newTokens.accessToken);
                        res.set('x-refresh-token', newTokens.refreshToken);
                        req.user = jwt.decode(newTokens.accessToken); // Set the new decoded token as user info
                        return next();
                    } else {
                        return next(createError(403, "Invalid refresh token"));
                    }
                }
                return next(createError(403, "Invalid token or token expired, sign in again"));
            }

            req.user = decoded; // Set the decoded user data to request
            next();
        });
    } catch (error) {
        console.error('Auth Middleware Error:', error.message);
        return next(createError(500, "Internal Server Error"));
    }
};

const refreshTokens = async (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.userId).exec();

        if (!user) {
            return null;
        }

        const newAccessToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30m' }
        );

        const newRefreshToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };

    } catch (error) {
        console.error('Refresh Token Error:', error.message);
        return null;
    }
};

module.exports = { authenticate };