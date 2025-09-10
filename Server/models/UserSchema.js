import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    balance: { type: Number, default: 100000 },
    Tier: { type: String, enum: ["Tier1", "Tier2", "Tier3"], default: "Tier1" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    accountNumber: { type: String, unique: true },
    transferPin: { type: String, select: false }, // hashed PIN
});

// Hash password, transferPin, and generate account number before saving
UserSchema.pre("save", async function (next) {
    if (this.isNew) {
        // Generate a unique 10-digit account number
        let unique = false;
        while (!unique) {
            const accNum = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            const existing = await mongoose.models.User.findOne({ accountNumber: accNum });
            if (!existing) {
                this.accountNumber = accNum;
                unique = true;
            }
        }
    }
    // Hash password if modified
    if (this.isModified("password")) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (err) {
            return next(err);
        }
    }
    // Hash transferPin if modified
    if (this.isModified("transferPin") && this.transferPin) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.transferPin = await bcrypt.hash(this.transferPin, salt);
        } catch (err) {
            return next(err);
        }
    }
    next();
});

const User = mongoose.model("User", UserSchema);
export default User;
