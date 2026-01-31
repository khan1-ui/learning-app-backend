import Quiz from "../models/Quiz.js";
import Result from "../models/Result.js";
import PurchasedSubject from "../models/PurchasedSubject.js";
import ModelAttempt from "../models/ModelAttempt.js";

const sanitizeQuestions = (questions = []) => {
  return questions.map((q, index) => ({
    question: q.question,
    options: q.options,
    correctAnswer: Number(q.correctAnswer),
    explanation:
      q.explanation && q.explanation.trim() !== ""
        ? q.explanation
        : `এই প্রশ্নটির সঠিক উত্তর হলো অপশন ${
            Number(q.correctAnswer) + 1
          }।`,
  }));
};


/* =========================
   CREATE QUIZ (MANUAL)
========================= */
export const createQuiz = async (req, res) => {
  try {
    if (!req.teacher) {
      return res.status(401).json({ message: "Teacher not authorized" });
    }

    const {
      title,
      classLevel,
      subject,
      chapterNo,
      chapterTitle,
      duration,
      questions,
      isPaid = false,
    } = req.body;

    if (
      !title ||
      !classLevel ||
      !subject ||
      !chapterNo ||
      !chapterTitle ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({ message: "Invalid quiz data" });
    }

    const sanitizedQuestions = sanitizeQuestions(questions);

    const quiz = await Quiz.create({
      title,
      classLevel: Number(classLevel),
      subject,
      chapterNo: Number(chapterNo),
      chapterTitle,
      duration: duration || 300,
      questions: sanitizedQuestions, // ✅ FIX
      isPaid,
      isPublished: false,
      teacher: req.teacher._id,
    });

    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    console.error("createQuiz error:", error);
    res.status(500).json({ message: "Quiz creation failed" });
  }
};


/* =========================
   IMPORT QUIZ FROM JSON
========================= */
export const importQuizFromJSON = async (req, res) => {
  try {
    if (!req.teacher) {
      return res.status(401).json({ message: "Teacher not authorized" });
    }

    const {
      title,
      classLevel,
      subject,
      chapterNo,
      chapterTitle,
      duration,
      questions,
      isPaid = false,
    } = req.body;

    if (
      !title ||
      !classLevel ||
      !subject ||
      !chapterNo ||
      !chapterTitle ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        message: "Invalid quiz JSON structure",
      });
    }

    const sanitizedQuestions = sanitizeQuestions(questions);

    const quiz = await Quiz.create({
      title,
      classLevel: Number(classLevel),
      subject,
      chapterNo: Number(chapterNo),
      chapterTitle,
      duration: duration || 300,
      questions: sanitizedQuestions, // ✅ FIX
      isPaid,
      isPublished: false,
      teacher: req.teacher._id,
    });

    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    console.error("importQuizFromJSON error:", error);
    res.status(500).json({ message: "Quiz import failed" });
  }
};


/* =========================
   TOGGLE PUBLISH
========================= */
export const togglePublish = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (quiz.teacher.toString() !== req.teacher._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    quiz.isPublished = !quiz.isPublished;
    await quiz.save();

    res.json({ success: true, data: quiz });
  } catch (error) {
    console.error("togglePublish error:", error);
    res.status(500).json({ message: "Publish toggle failed" });
  }
};

/* =========================
   DELETE QUIZ
========================= */
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (quiz.teacher.toString() !== req.teacher._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await quiz.deleteOne();
    res.json({ success: true, message: "Quiz deleted" });
  } catch (error) {
    console.error("deleteQuiz error:", error);
    res.status(500).json({ message: "Delete failed" });
  }
};

/* =========================
   TEACHER QUIZZES
========================= */
export const getTeacherQuizzes = async (req, res) => {
  const quizzes = await Quiz.find({ teacher: req.teacher._id }).sort({
    createdAt: -1,
  });

  res.json(quizzes);
};

/* =========================
   STUDENT: FREE MODELS
========================= */
export const getFreeModels = async (req, res) => {
  const { classLevel } = req.query;

  const quizzes = await Quiz.find({
    classLevel: Number(classLevel),
    isPaid: false,
    isPublished: true,
  }).sort({ chapterNo: 1 });

  res.json(quizzes);
};

/* =========================
   STUDENT: SUBJECT LIST
========================= */
export const getPaidSubjects = async (req, res) => {
  const { classLevel } = req.query;

  const subjects = await Quiz.distinct("subject", {
    classLevel: Number(classLevel),
    isPaid: true,
    isPublished: true,
  });

  res.json(subjects);
};

/* =========================
   STUDENT: CHAPTER LIST
========================= */
export const getPaidModels = async (req, res) => {
  const { classLevel, subject } = req.query;

  const quizzes = await Quiz.find({
    classLevel: Number(classLevel),
    subject,
    isPaid: true,
    isPublished: true,
  })
    .sort({ chapterNo: 1 })
    .select("_id title chapterNo chapterTitle duration");

  res.json(quizzes);
};

/* =========================
   CAN ATTEMPT QUIZ
========================= */
export const canAttemptQuiz = async (req, res, next) => {
  try {
    const quizId = req.params.id || req.params.quizId;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const isTrial = req.query.trial === "true";

    // 🆓 FREE TRIAL (one-time)
    if (isTrial) {
      const usedTrial = await ModelAttempt.findOne({
        student: req.user._id,
        quiz: quiz._id,
        isTrial: true,
      });

      if (usedTrial) {
        return res.status(403).json({
          message: "Free trial already used",
          code: "TRIAL_USED",
        });
      }

      req.quiz = quiz;
      req.isTrial = true;
      return next();
    }

    // 🆓 Free (non-paid) quiz
    if (!quiz.isPaid) {
      req.quiz = quiz;
      req.isTrial = false;
      return next();
    }

    // 🔐 Paid quiz
    const unlocked = await PurchasedSubject.findOne({
      student: req.user._id,
      classLevel: quiz.classLevel,
      subject: quiz.subject,
    });

    if (!unlocked) {
      return res.status(403).json({
        message: "Payment required",
        code: "PAID_LOCKED",
      });
    }

    req.quiz = quiz;
    req.isTrial = false;
    next();
  } catch (err) {
    console.error("❌ canAttemptQuiz error:", err);
    res.status(500).json({ message: "Cannot start MCQ" });
  }
};



/* =========================
   GET QUIZ (SAFE)
========================= */
export const getQuizById = async (req, res) => {
  try {
    if (!req.quiz) {
      return res.status(400).json({
        message: "Quiz not resolved by middleware",
      });
    }

    const quiz = req.quiz;
    const isTrial = req.isTrial === true;
    const TRIAL_LIMIT = 5;

    let questions = quiz.questions || [];

    if (isTrial) {
      if (questions.length < TRIAL_LIMIT) {
        return res.status(400).json({
          message: "Not enough questions for trial",
        });
      }

      questions = questions.slice(0, TRIAL_LIMIT);
    }

    res.json({
      _id: quiz._id,
      title: quiz.title,
      subject: quiz.subject,
      chapterNo: quiz.chapterNo,
      chapterTitle: quiz.chapterTitle,
      duration: isTrial
        ? questions.length * 60
        : quiz.duration,
      isTrial,
      trialLimit: isTrial ? TRIAL_LIMIT : null,
      questions: questions.map((q) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
      })),
    });
  } catch (err) {
    console.error("❌ getQuizById error:", err);
    res.status(500).json({ message: "Failed to start MCQ" });
  }
};






/* =========================
   📊 QUIZ ANALYTICS (TEACHER)
========================= */
export const quizAnalytics = async (req, res) => {
  try {
    const { quizId } = req.params;

    // 1️⃣ Quiz exists?
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    // 2️⃣ Ownership check (VERY IMPORTANT)
    if (quiz.teacher.toString() !== req.teacher._id.toString()) {
      return res.status(403).json({
        message: "Access denied: Not your quiz",
      });
    }

    // 3️⃣ Fetch results
    const results = await Result.find({ quiz: quizId });

    const totalAttempts = results.length;

    // 4️⃣ Safe average calculation
    const totalScore = results.reduce(
      (sum, r) => sum + (r.score || 0),
      0
    );

    const averageScore =
      totalAttempts === 0
        ? 0
        : Math.round(totalScore / totalAttempts);

    // 5️⃣ Response
    res.json({
      quizId,
      title: quiz.title,
      totalAttempts,
      averageScore,
    });
  } catch (err) {
    console.error("quizAnalytics error:", err);
    res.status(500).json({
      message: "Failed to load quiz analytics",
    });
  }
};
