import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    title: { type: String, required: true },
    content: { type: String }, // short notes / description
    videoUrl: { type: String }, // optional YouTube / hosted video
  },
  { timestamps: true }
);

export default mongoose.model("Chapter", chapterSchema);
