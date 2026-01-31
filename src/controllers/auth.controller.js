import User from "../models/User.js";
import Teacher from "../models/Teacher.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

/* ==========================
   STUDENT REGISTER
========================== */
export const registerUser = async (req, res) => {
  try {
    const { name, classLevel, password } = req.body;

    if (!name || !password || !classLevel) {
      return res.status(400).json({
        message: "Name, class and password are required",
      });
    }

    const exists = await User.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      password: hashedPassword,
      classLevel,
      role: "student",
      profileCompleted: false,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          classLevel: user.classLevel,
          role: user.role,
          phone: user.phone || "",
          avatar: user.avatar || "",
          profileCompleted: false,
        },
        token: generateToken({
          id: user._id,
          role: "student",
        }),
      },
    });
  } catch (error) {
    console.error("registerUser error:", error);
    res.status(500).json({ message: "Student registration failed" });
  }
};

/* ==========================
   STUDENT LOGIN
========================== */
export const loginUser = async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ name }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const profileCompleted = Boolean(user.phone && user.avatar);

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          classLevel: user.classLevel,
          role: user.role,
          phone: user.phone || "",
          avatar: user.avatar || "",
          profileCompleted,
        },
        token: generateToken({
          id: user._id,
          role: "student",
        }),
      },
    });
  } catch (error) {
    console.error("loginUser error:", error);
    res.status(500).json({ message: "Student login failed" });
  }
};

/* ==========================
   TEACHER REGISTER
========================== */
export const teacherRegister = async (req, res) => {
  try {
    const { email, password, secretKey } = req.body;

    if (secretKey !== process.env.TEACHER_SECRET_KEY) {
      return res.status(403).json({ message: "Invalid secret key" });
    }

    const exists = await Teacher.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Teacher already exists" });
    }

    const teacher = await Teacher.create({
      email,
      password,
      secretKey,
      role: "teacher",
      profileCompleted: false,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: teacher._id,
          email: teacher.email,
          role: "teacher",
          profileCompleted: false,
        },
        token: generateToken({
          id: teacher._id,
          role: "teacher",
        }),
      },
    });
  } catch (error) {
    console.error("teacherRegister error:", error);
    res.status(500).json({ message: "Teacher registration failed" });
  }
};

/* ==========================
   TEACHER LOGIN
========================== */
export const teacherLogin = async (req, res) => {
  try {
    const { email, password, secretKey } = req.body;

    if (!email || !password || !secretKey) {
      return res
        .status(400)
        .json({ message: "All fields are required" });
    }

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await teacher.matchPassword(password);
    if (!isMatch || teacher.secretKey !== secretKey) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: teacher._id,
          email: teacher.email,
          role: "teacher",
          profileCompleted: teacher.profileCompleted,
        },
        token: generateToken({
          id: teacher._id,
          role: "teacher",
        }),
      },
    });
  } catch (error) {
    console.error("teacherLogin error:", error);
    res.status(500).json({ message: "Teacher login failed" });
  }
};
