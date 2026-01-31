import express from "express";
import { getPrice, setPrice,getAllPrices } from "../controllers/price.controller.js";
import { protectUser, protectTeacher } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 🎓 Student → see price
router.get("/", protectUser, getPrice);

// 🧑‍🏫 Admin / Teacher → set price
router.post("/", protectTeacher, setPrice);
router.get("/all", protectTeacher, getAllPrices);


export default router;
