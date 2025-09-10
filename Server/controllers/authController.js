import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserSchema.js";
import nodemailer from "nodemailer";

// --- SIGNUP ---
export const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // ✅ Schema will hash password
        const newUser = new User({ firstName, lastName, email, password });
        await newUser.save();

        // Send welcome email (non-blocking)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Welcome to WebBank ",
            text: `Hello ${firstName},\n\nThank you for signing up! We're excited to have you on board.\n\nBest regards,\nThe Team`,
        };

        transporter.sendMail(mailOptions)
            .then(() => console.log(`Signup email sent to ${email}`))
            .catch(err => console.error("Signup email error:", err));

            res.status(201).json({
                message: "Signup successful!",
                user: {
                    id: newUser._id,
                    email: newUser.email,
                    name: `${newUser.firstName} ${newUser.lastName}`,
                    accountNumber: newUser.accountNumber,
                },
            });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// --- LOGIN ---
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log("Login attempt:", email);

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            console.log("No user found for", email);
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", isMatch);
        if (!isMatch) {
            console.log("Password mismatch for", email);
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Send login email (non-blocking)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Login Alert - Your Account",
            text: `Hello ${user.firstName || "User"},\n\nA login was detected on your account.\n\nTime: ${new Date().toLocaleString()}\n\nIf this wasn't you, please reset your password immediately.\n\nBest regards,\nThe Team`,
        };

        transporter.sendMail(mailOptions)
            .then(() => console.log(`Login email sent to ${user.email}`))
            .catch(err => console.error("Login email error:", err));

            res.status(200).json({
                message: "Login successful",
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`,
                    accountNumber: user.accountNumber,
                },
            });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
