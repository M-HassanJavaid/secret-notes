import mongoose from 'mongoose';
import validator from 'validator'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
    },

    email: {
        type: String,
        required: true,
        validate: {
            validator: (value) => validator.isEmail(value),
            message: 'Email is not valid'
        }
    },

    password: {
        type: String,
        required: true,
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    isLoggedIn: {
        type: Boolean,
        default: false,
    },

    token:{
        type: String,
        default: null
    },

    otp: {
        type: String,
        default: null
    },

    otpExpiry: {
        type: Date,
        default: null
    }

} , { timestamps: true })



const User = mongoose.model("User" , userSchema , "users");
export default User;
