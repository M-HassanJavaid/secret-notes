import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/database.js";
import dns from 'node:dns'
dns.setServers(['1.1.1.1', '8.8.8.8']);
import authRouter from './routers/authRouter.js'
import cookieParser from "cookie-parser";
import noteRouter from "./routers/noteRouter.js";
// const transactionRouter = require('./routes/transactionRoute.js');
// const checkAuth = require('./middlewares/authMiddleware.js');
// const dashboradRouter = require('./routes/dashboardRoute.js');

dotenv.config()
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors({
  origin: 'https://note-taker-five-eta.vercel.app',
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello from express')
});

app.use('/api/v1/auth' , authRouter);
app.use('/api/v1/note' , noteRouter)
// app.use('/api/v1/transaction' , checkAuth , transactionRouter);
// app.use('/api/v1/dashboard' , checkAuth , dashboradRouter)

// Connect to database
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`)
        })
    })