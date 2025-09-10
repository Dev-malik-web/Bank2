import express from "express";
import User from "../models/UserSchema.js";
import Transaction from "../models/Transaction.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get balance for logged-in user
router.get("/balance", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({
            balance: user.balance,
            accountNumber: user.accountNumber,
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch balance" });
    }
});

// Get real transaction history for logged-in user
router.get("/transactions", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await Transaction.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        })
        .sort({ date: -1 })
        .populate('sender', 'accountNumber')
        .populate('receiver', 'accountNumber');

        // Format for frontend
        const formatted = transactions.map(tx => ({
            date: tx.date.toLocaleString(),
            description: tx.sender._id.toString() === userId ? `To ${tx.receiver.accountNumber}` : `From ${tx.sender.accountNumber}`,
            amount: tx.amount,
            type: tx.sender._id.toString() === userId ? "debit" : "credit"
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch transactions" });
    }
});


// Set or update transfer PIN
router.post("/set-transfer-pin", auth, async (req, res) => {
    try {
        const { transferPin } = req.body;
        if (!transferPin || !/^[0-9]{4}$/.test(transferPin)) {
            return res.status(400).json({ message: "PIN must be a 4-digit number" });
        }
        const user = await User.findById(req.user.id).select("+transferPin");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.transferPin = transferPin;
        await user.save();
        res.status(200).json({ message: "Transfer PIN set successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});


// Get user profile (including transferPin presence)
router.get("/profile", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("firstName lastName email accountNumber transferPin");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            accountNumber: user.accountNumber,
            transferPin: !!user.transferPin // true if set, false if not
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
