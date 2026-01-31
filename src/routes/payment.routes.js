import express from "express";
import {
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
} from "../controllers/payment.controller.js";
import { protectUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/initiate", protectUser, initiatePayment);

// 🔥 SSLCommerz redirects with GET
router.post("/success", paymentSuccess);
router.post("/fail", paymentFail);
router.post("/cancel", paymentCancel);


export default router;
