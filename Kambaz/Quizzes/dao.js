import { quizModel, questionModel, quizAttemptModel } from "./model.js";
import { v4 as uuidv4 } from "uuid";

export default function QuizzesDao(db) {
  // Quiz CRUD operations
  function findQuizzesForCourse(courseId) {
    return quizModel.find({ course: courseId });
  }

  function findQuizById(quizId) {
    return quizModel.findOne({ _id: quizId });
  }

  function createQuiz(quiz) {
    const newQuiz = { ...quiz, _id: uuidv4() };
    return quizModel.create(newQuiz);
  }

  function updateQuiz(quizId, quizUpdates) {
    return quizModel.updateOne({ _id: quizId }, { $set: quizUpdates });
  }

  function deleteQuiz(quizId) {
    return quizModel.deleteOne({ _id: quizId });
  }

  function togglePublishQuiz(quizId, published) {
    return quizModel.updateOne({ _id: quizId }, { $set: { published } });
  }

  function findQuestionsForQuiz(quizId) {
    return questionModel.find({ quiz: quizId }).sort({ order: 1 });
  }

  function findQuestionById(questionId) {
    return questionModel.findOne({ _id: questionId });
  }

  function createQuestion(question) {
    const newQuestion = { ...question, _id: uuidv4() };
    return questionModel.create(newQuestion);
  }

  function updateQuestion(questionId, questionUpdates) {
    return questionModel.updateOne({ _id: questionId }, { $set: questionUpdates });
  }

  function deleteQuestion(questionId) {
    return questionModel.deleteOne({ _id: questionId });
  }

  function deleteQuestionsForQuiz(quizId) {
    return questionModel.deleteMany({ quiz: quizId });
  }

  async function getQuizTotalPoints(quizId) {
    const questions = await questionModel.find({ quiz: quizId });
    return questions.reduce((sum, q) => sum + (q.points || 0), 0);
  }

  function findAttemptsForQuiz(quizId, studentId = null) {
    const query = { quiz: quizId };
    if (studentId) {
      query.student = studentId;
    }
    return quizAttemptModel.find(query).sort({ attemptNumber: -1 });
  }

  function findAttemptById(attemptId) {
    return quizAttemptModel.findOne({ _id: attemptId });
  }

  function findLatestAttempt(quizId, studentId) {
    return quizAttemptModel.findOne({ quiz: quizId, student: studentId }).sort({ attemptNumber: -1 });
  }

  function countAttempts(quizId, studentId) {
    return quizAttemptModel.countDocuments({ quiz: quizId, student: studentId });
  }

  function createAttempt(attempt) {
    const newAttempt = { ...attempt, _id: uuidv4() };
    return quizAttemptModel.create(newAttempt);
  }

  function updateAttempt(attemptId, attemptUpdates) {
    return quizAttemptModel.updateOne({ _id: attemptId }, { $set: attemptUpdates });
  }

  function deleteAttemptsForQuiz(quizId) {
    return quizAttemptModel.deleteMany({ quiz: quizId });
  }

  return {
    findQuizzesForCourse,
    findQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    togglePublishQuiz,
    findQuestionsForQuiz,
    findQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    deleteQuestionsForQuiz,
    getQuizTotalPoints,
    findAttemptsForQuiz,
    findAttemptById,
    findLatestAttempt,
    countAttempts,
    createAttempt,
    updateAttempt,
    deleteAttemptsForQuiz,
  };
}