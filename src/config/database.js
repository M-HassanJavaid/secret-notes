import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

async function connectDB() {
    console.log(process.env.MONGO_URI)
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected!')
}

export default connectDB