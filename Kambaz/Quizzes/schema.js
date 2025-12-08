import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    _id: String,
    course: String,
    title: { type: String, default: "Untitled Quiz" },
    description: { type: String, default: "" },
    quizType: {
      type: String,
      enum: ["GRADED_QUIZ", "PRACTICE_QUIZ", "GRADED_SURVEY", "UNGRADED_SURVEY"],
      default: "GRADED_QUIZ",
    },
    points: { type: Number, default: 0 },
    assignmentGroup: {
      type: String,
      enum: ["QUIZZES", "EXAMS", "ASSIGNMENTS", "PROJECT"],
      default: "QUIZZES",
    },
    shuffleAnswers: { type: Boolean, default: true },
    timeLimit: { type: Number, default: 20 },
    multipleAttempts: { type: Boolean, default: false },
    attemptsAllowed: { type: Number, default: 1 },
    showCorrectAnswers: {
      type: String,
      enum: ["IMMEDIATELY", "AFTER_DUE_DATE", "NEVER"],
      default: "IMMEDIATELY",
    },
    accessCode: { type: String, default: "" },
    oneQuestionAtTime: { type: Boolean, default: true },
    webcamRequired: { type: Boolean, default: false },
    lockQuestionsAfterAnswering: { type: Boolean, default: false },
    dueDate: Date,
    availableDate: Date,
    availableUntil: Date,
    published: { type: Boolean, default: false },
  },
  { collection: "quizzes" }
);

const questionSchema = new mongoose.Schema(
  {
    _id: String,
    quiz: String,
    type: {
      type: String,
      enum: ["MULTIPLE_CHOICE", "TRUE_FALSE", "FILL_IN_BLANK"],
      default: "MULTIPLE_CHOICE",
    },
    title: { type: String, default: "New Question" },
    points: { type: Number, default: 1 },
    question: String,
    order: { type: Number, default: 0 },
    // For Multiple Choice
    choices: [
      {
        id: String,
        text: String,
        isCorrect: Boolean,
      },
    ],
    // For True/False
    correctAnswer: Boolean,
    // For Fill in Blank
    possibleAnswers: [String],
    caseSensitive: { type: Boolean, default: false },
  },
  { collection: "questions" }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    _id: String,
    quiz: String,
    student: String,
    attemptNumber: Number,
    answers: [
      {
        question: String,
        answer: mongoose.Schema.Types.Mixed,
        isCorrect: Boolean,
        pointsEarned: Number,
      },
    ],
    score: { type: Number, default: 0 },
    totalPoints: Number,
    startedAt: Date,
    submittedAt: Date,
    timeSpent: Number,
  },
  { collection: "quizAttempts" }
);

export { quizSchema, questionSchema, quizAttemptSchema };