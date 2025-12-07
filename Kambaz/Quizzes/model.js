import mongoose from "mongoose";
import { quizSchema, questionSchema, quizAttemptSchema } from "./schema.js";

const quizModel = mongoose.model("QuizModel", quizSchema);
const questionModel = mongoose.model("QuestionModel", questionSchema);
const quizAttemptModel = mongoose.model("QuizAttemptModel", quizAttemptSchema);

export { quizModel, questionModel, quizAttemptModel };