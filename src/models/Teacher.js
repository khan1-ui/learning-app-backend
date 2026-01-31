import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    secretKey: { type: String, required: true },
    subject: String,
    phone: String,
    avatar: String,
    role: { type: String, default: "teacher" },
    profileCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

teacherSchema.pre("save", async function () {
  if (!this.isModified("password")) return ;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
});

teacherSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("Teacher", teacherSchema);
