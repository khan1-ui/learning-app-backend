import User from "../models/User.js";

// Update profile (phone, class, etc)
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.classLevel) user.classLevel = req.body.classLevel;
    if (req.file) user.avatar = `/uploads/${req.file.filename}`;

    user.profileCompleted = true;

    await user.save();

    res.json({
      data: {
        phone: user.phone,
        classLevel: user.classLevel,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Profile update failed" });
  }
};

// Update avatar only
export const updateUserAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user._id);
    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ avatar: user.avatar });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Avatar update failed" });
  }
};