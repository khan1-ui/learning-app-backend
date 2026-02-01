import express from "express";
import cors from "cors";
import path from "path";
import progressRoutes from "./routes/progress.routes.js"
import mcqRoutes from "./routes/mcq.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/userRoutes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import subjectRoutes from "./routes/subject.routes.js";
import chapterRoutes from "./routes/chapter.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import resultRoutes from "./routes/result.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import purchaseRoutes from "./routes/purchase.routes.js";
import priceRoutes from "./routes/price.routes.js"
import paymentRoutes from "./routes/payment.routes.js";

const app = express();

/* ======================
   CORS (FIRST)
====================== */
/* ======================
   CORS (FIRST - FIXED)
====================== */
const allowedOrigins = [
  "http://localhost:5173", // local frontend
  "https://learning-app-backend-8o8a.onrender.com", // backend self
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 🔥 Let cors handle preflight automatically
app.options("*", cors());

/* ---------- PREFLIGHT HANDLER (VERY IMPORTANT) ---------- */
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return res.sendStatus(204);
  }
  next();
});

/* ======================
   BODY PARSER
====================== */
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

/* ======================
   STATIC FILES
====================== */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* ======================
   TEST ROUTES
====================== */
app.get("/", (req, res) => {
  res.send("Learn With Sazin API Running");
});

/* ======================
   API ROUTES
====================== */
app.use("/api/prices", priceRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/mcq", mcqRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/results", resultRoutes);

/* ======================
   ERROR HANDLER (LAST)
====================== */
app.use(errorHandler);

export default app;
