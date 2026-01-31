import jwt from "jsonwebtoken";
import Teacher from "../models/Teacher.js";

export const protectTeacher = async (req, res, next) => {
  try {
    let token;

    // 1️⃣ Authorization header check
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized: Token missing",
      });
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized: Invalid token payload",
      });
    }

    // 3️⃣ Find teacher from DB
    const teacher = await Teacher.findById(decoded.id).select("-password");

    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: "Not authorized: Teacher not found",
      });
    }

    // 4️⃣ Optional role safety (future proof)
    if (teacher.role !== "teacher") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Not a teacher",
      });
    }

    // 5️⃣ Attach teacher to request
    req.teacher = teacher;

    next();
  } catch (error) {
    console.error("protectTeacher error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Not authorized: Token failed",
    });
  }
};
