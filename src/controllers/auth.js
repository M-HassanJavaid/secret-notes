import User from '../models/auth.js'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'
import sendEmail from '../utils/sendMail.js';
dotenv.config();

export async function signup(req, res) {
    try {
        let { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: 'One or more field is missing.'
            })
        }

        let isEmailExist = await User.findOne({ email });

        if (isEmailExist) {
            return res.status(409).json({
                success: false,
                message: "Email is already exist"
            })
        }

        let hashedPassword = await bcrypt.hash(password, 10);


        let newUser = new User({
            name,
            password: hashedPassword,
            email,
        });

        let savedUser = (await newUser.save()).toObject();
        delete savedUser.password;

        const authtoken = jwt.sign({
            userId: savedUser._id
        }, process.env.JWT_SECRET, { expiresIn: '7d' });

        const verificationToken = jwt.sign({
            userId: savedUser._id
        }, process.env.JWT_SECRET, { expiresIn: '10m' });

        await sendEmail({
            to: savedUser.email,
            subject: 'Verify your email',
            template: 'verificationEmail',
            context: {
                name: savedUser.name,
                verificationUrl: `https://secret-notes-mu.vercel.app/api/v1/auth/markVerify/${verificationToken}`,
                year: new Date().getFullYear()
            }
        })

        res.cookie("authToken", authtoken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,          // REQUIRED in production (HTTPS)
            sameSite: "none",
        });


        res.status(200).json({
            success: true,
            message: 'User has successfully signup!',
            user: savedUser
        })

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        })

    }
}

export async function login(req, res) {
    try {
        let { email, password } = req.body ;
        console.log({ email, password })

        // ensure both email and password are provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "One or more field is missing."
            })
        }

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        let isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        const token = jwt.sign({
            userId: user._id,
        }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie("authToken", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,          // REQUIRED in production (HTTPS)
            sameSite: "none",
        });

        user.toObject();
        delete user.password

        res.status(200).json({
            success: true,
            message: 'User has successfully login.',
            user
        })


    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        })

    }
}

export async function markUserVerify(req, res) {
    try {
        const { token } = req.params;
        if (!token) throw new Error('Token is missing!');
        let decode = jwt.verify(token, process.env.JWT_SECRET);
        let { userId } = decode;
        let user = await User.findById(userId);
        if (!user) throw new Error('User not found!')
        user.isVerified = true;
        await user.save();

        res.redirect(process.env.CLIENT_URL);

    } catch (error) {
        res.send(error.message)
    }
};

export async function resendVerificationMail(req, res) {
    try {
        let token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'User is not login'
            })
        }

        let decode = jwt.verify(token, process.env.JWT_SECRET);
        if (!decode) {
            return res.status(401).json({
                success: false,
                message: 'Login session has expired'
            })
        }

        let user = await User.findById(decode?.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        if (user.isVerified) {
            return res.status(401).json({
                success: false,
                message: 'User is already verified'
            })
        }

        const verificationToken = jwt.sign({
            userId: user._id
        }, process.env.JWT_SECRET, { expiresIn: '10m' });

        await sendEmail({
            to: user.email,
            subject: 'Verify your email',
            template: 'verificationEmail',
            context: {
                name: user.name,
                verificationUrl: `https://secret-notes-mu.vercel.app/api/v1/auth/markVerify/${verificationToken}`,
                year: new Date().getFullYear()
            }
        })

        res.status(200).json({
            success: true,
            message: 'Verification email has sent to you!'
        })
    } catch (error) {
        res.status(501).json({
            success: false,
            message: error.message
        })
    }
}

export async function sentOtpForResetPass(req, res) {
    try {

        let { email } = req.body;
        if (!email) {
            return res.status(401).json({
                success: false,
                message: 'Email is required'
            })
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Email is not register'
            })
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        const expiryTimeOfOtp = Date.now() + 10 * 60 * 1000;

        const hashedOtp = await bcrypt.hash( otp.toString() , 10 );

        user.otp = hashedOtp;
        user.otpExpiry = expiryTimeOfOtp;

        user.save();

        sendEmail({
            to: user.email,
            subject: 'OTP to reset your account password',
            template: 'passwordReset',
            context: {
                otp,
                expiryTime: '10',
                name: user.name
            }
        });

        res.status(200).json({
            success: true,
            message: 'OTP has successfully sent!'
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }



}

export async function verifyOtp(req , res) {
    try {
        let { otp , email } = req.body;
        let user = await User.findOne({email});
        let currentTime = new Date();
        let otpExpiryTime = new Date(user.otpExpiry);
        let isOtpExpired = currentTime > otpExpiryTime;
        if (isOtpExpired) {
            return res.status(400).json({
                success: false,
                message: 'Otp has expired'
            })
        }
        let isOtpCorrect = await bcrypt.compare(otp , user.otp);
        if (!isOtpCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Wrong OTP'
            })
        }

        let resetPasswordToken = jwt.sign({
            otp,
            userId: user._id
        } , process.env.JWT_SECRET , { expiresIn: '1d' });

        res.cookie('resetPasswordToken' , resetPasswordToken , {
            maxAge: 1 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,          // REQUIRED in production (HTTPS)
            sameSite: "none",
        });

        res.status(200).json({
            success: true,
            message: 'OTP has verified, now enter new password.'
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export async function changePassword(req , res) {
    try {
        let { resetPasswordToken } = req.cookies;
        let { newPassword } = req.body;
        let decode = jwt.verify(resetPasswordToken , process.env.JWT_SECRET);
        if (!decode) {
            return res.json({
                success: false,
                message: 'First verify your otp'
            })
        }

        let user = await User.findById(decode.userId);


        let isOtpCorrect = await bcrypt.compare( decode.otp , user.otp );
        let otpExpiryTime = new Date(user.otpExpiry);
        let currentTime = new Date();
        let isOtpExpired = currentTime > otpExpiryTime;

        if (!isOtpCorrect || isOtpExpired) {

            return res.status(403).json({
                success: false,
                message: 'Otp verification has expired.'
            })
        }

        let newHashedPassword = await bcrypt.hash(newPassword , 10);
        user.password = newHashedPassword;
        user.otp = null;
        user.otpExpiry = null;
        user.save();

        res.clearCookie('resetPasswordToken');
        res.clearCookie('authToken');

        res.status(200).json({
            success: true,
            message: 'Password has change successfully'
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export async function getUser(req , res) {
    try {
        let authToken = req.cookies.authToken;
        if (!authToken) {
            return res.status(401).json({
                isLogin: false
            })
        }

        let decode = jwt.verify(authToken , process.env.JWT_SECRET);
        if (!decode) {
            return res.status(401).json({
                isLogin: false
            })
        }

        let user = await User.findById(decode?.userId).select('-password').lean();
        if (!user) {
            return res.status(404).json({
                isLogin: false
            })
        }

        res.status(200).json({
            isLogin: true,
            user: user
        })

    } catch (error) {
        res.status(500).json({
            isLogin: false
        })
    }
}

export async function getLogout(req , res) {
    try {
        res.clearCookie('authToken');
        res.status(200).json({
            success: true,
            message: 'Logout successfully.'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}