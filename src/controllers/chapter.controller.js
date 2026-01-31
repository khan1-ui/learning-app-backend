import Chapter from "../models/Chapter.js";

// @desc    Create Chapter
// @route   POST /api/chapters
export const createChapter = async (req, res) => {
  try {
    const { subject, title, content, videoUrl } = req.body;

    if (!subject || !title) {
      return res.status(400).json({ message: "Subject and Title are required" });
    }

    const chapter = await Chapter.create({ subject, title, content, videoUrl });
    res.status(201).json(chapter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Chapters by Subject
// @route   GET /api/chapters/:subjectId
export const getChaptersBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const chapters = await Chapter.find({ subject: subjectId });
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
