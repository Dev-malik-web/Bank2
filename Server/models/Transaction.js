import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["transfer"], default: "transfer" },
    date: { type: Date, default: Date.now },
});

export default mongoose.model("Transaction", TransactionSchema);
