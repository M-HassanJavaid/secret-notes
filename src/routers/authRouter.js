import express from 'express'
import { changePassword, getLogout, getUser, login, markUserVerify, resendVerificationMail, sentOtpForResetPass, signup, verifyOtp } from '../controllers/auth.js';
const authRouter = express.Router();
// const checkAuth = require('../middlewares/authMiddleware.js');
// const upload = require('../middlewares/upload.js');



authRouter.post('/signup' , signup);
authRouter.post('/login' , login);
authRouter.get('/markVerify/:token' , markUserVerify);
authRouter.put('/resend-verification-email' , resendVerificationMail);
authRouter.post('/otp-for-reset-password' , sentOtpForResetPass);
authRouter.put('/verify-otp' , verifyOtp);
authRouter.put('/change-password' , changePassword);
authRouter.get('/getUser' , getUser);
authRouter.get('/logout' , getLogout)

// authRouter.post('/login' , login);
// authRouter.put('/GetVerificationEmail'  , sendVerificationEmail );
// authRouter.get('/markVerify' , markUserVerify)
// authRouter.get('/isLogin' , checkAuth,  isLogin);
// authRouter.put('/logout' , logout);


export default authRouter