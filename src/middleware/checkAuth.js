import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
import User from "../models/auth.js";
dotenv.config();

async function checkAuth(req, res, next) {
    try {
        let authToken = req.cookies.authToken;
        if (!authToken) {
            return res.status(401).json({
                success: false,
                message: 'User is not login'
            })
        }

        let decode = jwt.verify(authToken, process.env.JWT_SECRET);

        if (!decode) {
            return res.status(401).json({
                success: false,
                message: 'User is not login'
            })
        }

        let userId = decode.userId;
        if (!userId) {
            return res.status(404).json({
                success: false,
                message: 'user ID not found!'
            })
        }
        let user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Your account has removed!'
            })
        }

        if (!user.isVerified) {
            return res.status(401).json({
                success: false,
                message: 'Your account is not verified!'
            })
        }
        req.user = user;
        next()

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export default checkAuth;