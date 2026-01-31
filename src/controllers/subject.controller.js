import Subject from "../models/Subject.js";

// @desc    Create Subject
// @route   POST /api/subjects
export const createSubject = async (req, res) => {
  try {
    const { classLevel, name } = req.body;

    if (!classLevel || !name) {
      return res.status(400).json({ message: "All fields required" });
    }

    const subjectExists = await Subject.findOne({ classLevel, name });
    if (subjectExists) {
      return res.status(400).json({ message: "Subject already exists for this class" });
    }

    const subject = await Subject.create({ classLevel, name });
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Subjects (Optional: class filter)
// @route   GET /api/subjects?classLevel=6
export const getSubjects = async (req, res) => {
  try {
    const filter = req.query.classLevel ? { classLevel: req.query.classLevel } : {};
    const subjects = await Subject.find(filter);
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
