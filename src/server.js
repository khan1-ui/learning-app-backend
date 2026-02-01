import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("JWT_SECRET CHECK =>", process.env.JWT_SECRET);
console.log("TEACHER_SECRET_KEY CHECK =>", process.env.TEACHER_SECRET_KEY);

  console.log("ENV CHECK", {
  STORE_ID: process.env.SSLCOMMERZ_STORE_ID,
  STORE_PASS: process.env.SSLCOMMERZ_STORE_PASS,
});

});
