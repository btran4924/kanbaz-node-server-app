import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    _id: String,
    user: { type: String, ref: "UserModel" },
    course: { type: String, ref: "CourseModel" },
  },
  { collection: "enrollments" }
);

export default enrollmentSchema;