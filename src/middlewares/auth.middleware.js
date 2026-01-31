import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Teacher from "../models/Teacher.js";

/* ==========================
   COMMON TOKEN VERIFIER
========================== */
const verifyToken = (req) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new Error("No token provided");
  }

  return jwt.verify(token, process.env.JWT_SECRET);
};

/* ==========================
   🔐 PROTECT STUDENT ROUTES
========================== */
export const protectUser = async (req, res, next) => {
  try {
    const decoded = verifyToken(req);

    // 🔒 Role check
    if (decoded.role !== "student") {
      return res.status(403).json({
        message: "Access denied: Student only",
      });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Student not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("protectUser error:", error.message);
    res.status(401).json({
      message: "Not authorized",
    });
  }
};

/* ==========================
   🔐 PROTECT TEACHER ROUTES
========================== */
export const protectTeacher = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 🔥 ROLE CHECK (CRITICAL)
  if (decoded.role !== "teacher") {
    return res.status(403).json({ message: "Teacher access only" });
  }

  const teacher = await Teacher.findById(decoded.id);
  if (!teacher) {
    return res.status(401).json({ message: "Teacher not found" });
  }

  req.teacher = teacher;
  next();
};

