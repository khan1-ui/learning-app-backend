import express from "express";
import {
  purchaseSubject,
  checkSubjectPurchase,
} from "../controllers/purchase.controller.js";
import { protectUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 🔓 Unlock subject (fake purchase)
router.post("/subject", protectUser, purchaseSubject);

// 🔍 Check subject unlocked or not
router.get("/check", protectUser, checkSubjectPurchase);

export default router;
