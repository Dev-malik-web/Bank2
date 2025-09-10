import express from "express";
import auth from "../middleware/auth.js";
import { transfer } from "../controllers/transactionController.js";

const router = express.Router();

// Transfer money between accounts
router.post("/transfer", auth, transfer);

export default router;
