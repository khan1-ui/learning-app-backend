export const createTeacherProfile = async (req, res) => {
  try {
    const teacher = req.teacher;

    teacher.name = req.body.name || teacher.name;
    teacher.phone = req.body.phone || teacher.phone;
    teacher.subject = req.body.subject || teacher.subject;

    if (req.file) {
      teacher.avatar = `/uploads/${req.file.filename}`;
    }

    teacher.profileCompleted = true;
    await teacher.save();

    res.status(200).json({
      success: true,
      data: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        avatar: teacher.avatar,
        role: teacher.role,
        profileCompleted: true,
      },
    });
  } catch {
    res.status(500).json({ message: "Profile update failed" });
  }
};
