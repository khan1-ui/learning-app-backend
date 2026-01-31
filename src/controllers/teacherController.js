import Teacher from "../models/Teacher.js";

export const createTeacherProfile = async (req, res) => {
  try {
    const teacher = req.teacher;

    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    teacher.phone = req.body.phone || teacher.phone;
    teacher.subject = req.body.subject || teacher.subject;
    if (req.file) teacher.avatar = `/uploads/${req.file.filename}`;
    teacher.profileCompleted = true;

    await teacher.save();

    res.status(200).json({ success: true, data: teacher });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Profile creation failed" });
  }
};
