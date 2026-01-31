import express from "express";
import { protectUser } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import {
  updateUserProfile,
  updateUserAvatar,
} from "../controllers/userController.js";

const router = express.Router();

// Create / update profile
router.post("/profile", protectUser, upload.single("avatar"), updateUserProfile);

// ✅ New route for avatar update
router.put(
  "/profile/avatar",
  protectUser,
  upload.single("avatar"),
  updateUserAvatar
);

export default router;
