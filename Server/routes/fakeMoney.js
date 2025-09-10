import express from "express";
import { sendFakeMoney } from "../controllers/fakeMoneyController.js";

const router = express.Router();

// Send fake money to a user (for demo/testing)
router.post("/send", sendFakeMoney);

export default router;
