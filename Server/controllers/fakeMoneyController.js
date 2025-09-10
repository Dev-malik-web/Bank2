import User from "../models/UserSchema.js";

export const sendFakeMoney = async (req, res) => {
    try {
        const { accountNumber, amount } = req.body;
        if (!accountNumber || !amount) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (amount <= 0) {
            return res.status(400).json({ message: "Amount must be positive" });
        }
        const user = await User.findOne({ accountNumber });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.balance += Number(amount);
        await user.save();
        res.status(200).json({ message: `₦${amount} sent to account ${accountNumber}` });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
