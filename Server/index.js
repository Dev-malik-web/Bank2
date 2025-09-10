import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import ejs from "ejs";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import transactionRoutes from "./routes/transaction.js";
import fakeMoneyRoutes from "./routes/fakeMoney.js";

dotenv.config();

const app = express();
const port = 5000;


app.use(cors());
app.use(express.json());

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use("/api", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/fake-money", fakeMoneyRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to the Bank API");
});

app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});
