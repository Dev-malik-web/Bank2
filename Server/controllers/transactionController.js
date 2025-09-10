import User from "../models/UserSchema.js";
import Transaction from "../models/Transaction.js";
import bcrypt from "bcryptjs";

export const transfer = async (req, res) => {
    try {
        const { receiverAccountNumber, amount, transferPin } = req.body;
        const senderId = req.user.id;
        if (!receiverAccountNumber || !amount || !transferPin) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!/^[0-9]{4}$/.test(transferPin)) {
            return res.status(400).json({ message: "PIN must be a 4-digit number" });
        }
        if (amount <= 0) {
            return res.status(400).json({ message: "Amount must be positive" });
        }
        // Get sender with transferPin field
        const sender = await User.findById(senderId).select("+transferPin balance");
        const receiver = await User.findOne({ accountNumber: receiverAccountNumber });
        if (!sender || !receiver) {
            return res.status(404).json({ message: "Sender or receiver not found" });
        }
        if (!sender.transferPin) {
            return res.status(400).json({ message: "You must set a transfer PIN before making transfers" });
        }
        const pinMatch = await bcrypt.compare(transferPin, sender.transferPin);
        if (!pinMatch) {
            return res.status(401).json({ message: "Incorrect transfer PIN" });
        }
        if (sender.balance < amount) {
            return res.status(400).json({ message: "Insufficient funds" });
        }
        sender.balance -= amount;
        receiver.balance += amount;
        await sender.save();
        await receiver.save();
        const transaction = new Transaction({ sender: sender._id, receiver: receiver._id, amount });
        await transaction.save();
        res.status(200).json({ message: "Transfer successful", transaction });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
