import QuizzesDao from "./dao.js";

export default function QuizRoutes(app, db) {
  const dao = QuizzesDao(db);

  // Get all quizzes for a course
  const findQuizzesForCourse = async (req, res) => {
    const { courseId } = req.params;
    const currentUser = req.session.currentUser;

    const quizzes = await dao.findQuizzesForCourse(courseId);

    // Students only see published quizzes
    if (currentUser?.role === "STUDENT") {
      const publishedQuizzes = quizzes.filter((quiz) => quiz.published);

      // Add latest score for each quiz
      const quizzesWithScores = await Promise.all(
        publishedQuizzes.map(async (quiz) => {
          const latestAttempt = await dao.findLatestAttempt(quiz._id, currentUser._id);
          return {
            ...quiz.toObject(),
            latestScore: latestAttempt ? latestAttempt.score : null,
          };
        })
      );
      return res.json(quizzesWithScores);
    }

    res.json(quizzes);
  };

  // Create a new quiz
  const createQuizForCourse = async (req, res) => {
    const { courseId } = req.params;
    const quiz = {
      ...req.body,
      course: courseId,
    };
    const newQuiz = await dao.createQuiz(quiz);
    res.send(newQuiz);
  };

  // Get quiz by ID
  const findQuizById = async (req, res) => {
    const { quizId } = req.params;
    const quiz = await dao.findQuizById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Students can only see published quizzes
    const currentUser = req.session.currentUser;
    if (currentUser?.role === "STUDENT" && !quiz.published) {
      return res.status(403).json({ message: "Quiz not available" });
    }

    res.json(quiz);
  };

  // Update quiz
  const updateQuiz = async (req, res) => {
    const { quizId } = req.params;
    const quizUpdates = req.body;
    const status = await dao.updateQuiz(quizId, quizUpdates);
    res.send(status);
  };

  // Delete quiz
  const deleteQuiz = async (req, res) => {
    const { quizId } = req.params;

    // Delete quiz, questions, and attempts
    await dao.deleteQuiz(quizId);
    await dao.deleteQuestionsForQuiz(quizId);
    await dao.deleteAttemptsForQuiz(quizId);

    res.sendStatus(204);
  };

  // Toggle publish status
  const togglePublishQuiz = async (req, res) => {
    const { quizId } = req.params;
    const quiz = await dao.findQuizById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const newPublishedState = !quiz.published;
    await dao.togglePublishQuiz(quizId, newPublishedState);

    const updatedQuiz = await dao.findQuizById(quizId);
    res.json(updatedQuiz);
  };

  // Get questions for a quiz
  const findQuestionsForQuiz = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session.currentUser;

    const questions = await dao.findQuestionsForQuiz(quizId);

    // For students taking quiz, don't send correct answers
    if (currentUser?.role === "STUDENT") {
      const sanitizedQuestions = questions.map((q) => {
        const qObj = q.toObject();
        if (qObj.type === "MULTIPLE_CHOICE") {
          qObj.choices = qObj.choices.map((c) => ({
            id: c.id,
            text: c.text,
          }));
        }
        delete qObj.correctAnswer;
        delete qObj.possibleAnswers;
        return qObj;
      });
      return res.json(sanitizedQuestions);
    }

    res.json(questions);
  };

  // Create question
  const createQuestion = async (req, res) => {
    const { quizId } = req.params;

    // Get highest order number
    const questions = await dao.findQuestionsForQuiz(quizId);
    const highestOrder = questions.length > 0 ? Math.max(...questions.map((q) => q.order)) : -1;

    const question = {
      ...req.body,
      quiz: quizId,
      order: highestOrder + 1,
    };

    const newQuestion = await dao.createQuestion(question);

    // Update quiz total points
    const totalPoints = await dao.getQuizTotalPoints(quizId);
    await dao.updateQuiz(quizId, { points: totalPoints });

    res.send(newQuestion);
  };

  // Update question
  const updateQuestion = async (req, res) => {
    const { questionId } = req.params;
    const questionUpdates = req.body;

    const question = await dao.findQuestionById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const status = await dao.updateQuestion(questionId, questionUpdates);

    // Update quiz total points
    const totalPoints = await dao.getQuizTotalPoints(question.quiz);
    await dao.updateQuiz(question.quiz, { points: totalPoints });

    res.send(status);
  };

  // Delete question
  const deleteQuestion = async (req, res) => {
    const { questionId } = req.params;

    const question = await dao.findQuestionById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    await dao.deleteQuestion(questionId);

    // Update quiz total points
    const totalPoints = await dao.getQuizTotalPoints(question.quiz);
    await dao.updateQuiz(question.quiz, { points: totalPoints });

    res.sendStatus(204);
  };

  // Start a quiz attempt
  const startAttempt = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session.currentUser;

    if (!currentUser) {
      return res.status(401).json({ message: "Must be logged in" });
    }

    const quiz = await dao.findQuizById(quizId);

    if (!quiz || !quiz.published) {
      return res.status(404).json({ message: "Quiz not available" });
    }

    // Check if student has remaining attempts
    const attemptCount = await dao.countAttempts(quizId, currentUser._id);

    if (!quiz.multipleAttempts && attemptCount > 0) {
      return res.status(403).json({ message: "No more attempts allowed" });
    }

    if (quiz.multipleAttempts && attemptCount >= quiz.attemptsAllowed) {
      return res.status(403).json({ message: "No more attempts allowed" });
    }

    // Check access code
    if (quiz.accessCode && req.body.accessCode !== quiz.accessCode) {
      return res.status(403).json({ message: "Invalid access code" });
    }

    const attempt = {
      quiz: quizId,
      student: currentUser._id,
      attemptNumber: attemptCount + 1,
      startedAt: new Date(),
      totalPoints: quiz.points,
      answers: [],
    };

    const newAttempt = await dao.createAttempt(attempt);
    res.send(newAttempt);
  };

  // Submit quiz attempt
  const submitAttempt = async (req, res) => {
    const { attemptId } = req.params;
    const { answers } = req.body;
    const currentUser = req.session.currentUser;

    const attempt = await dao.findAttemptById(attemptId);

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    if (attempt.student !== currentUser._id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Get questions to grade
    const questions = await dao.findQuestionsForQuiz(attempt.quiz);

    const gradedAnswers = answers.map((answer) => {
      const question = questions.find((q) => q._id === answer.question);
      if (!question) return answer;

      let isCorrect = false;

      switch (question.type) {
        case "MULTIPLE_CHOICE":
          const correctChoice = question.choices.find((c) => c.isCorrect);
          isCorrect = correctChoice && answer.answer === correctChoice.id;
          break;

        case "TRUE_FALSE":
          isCorrect = answer.answer === question.correctAnswer;
          break;

        case "FILL_IN_BLANK":
          const studentAnswer = question.caseSensitive
            ? answer.answer
            : answer.answer.toLowerCase();
          isCorrect = question.possibleAnswers.some((possible) => {
            const possibleAnswer = question.caseSensitive
              ? possible
              : possible.toLowerCase();
            return studentAnswer === possibleAnswer;
          });
          break;
      }

      return {
        question: answer.question,
        answer: answer.answer,
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0,
      };
    });

    const score = gradedAnswers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
    const submittedAt = new Date();
    const timeSpent = Math.floor((submittedAt - new Date(attempt.startedAt)) / 1000);

    await dao.updateAttempt(attemptId, {
      answers: gradedAnswers,
      score,
      submittedAt,
      timeSpent,
    });

    const updatedAttempt = await dao.findAttemptById(attemptId);
    res.json(updatedAttempt);
  };

  // Get latest attempt
  const getLatestAttempt = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session.currentUser;

    if (!currentUser) {
      return res.status(401).json({ message: "Must be logged in" });
    }

    const attempt = await dao.findLatestAttempt(quizId, currentUser._id);

    if (!attempt) {
      return res.status(404).json({ message: "No attempts found" });
    }

    res.json(attempt);
  };

  // Get all attempts for a quiz
  const getAttempts = async (req, res) => {
    const { quizId } = req.params;
    const currentUser = req.session.currentUser;

    if (!currentUser) {
      return res.status(401).json({ message: "Must be logged in" });
    }

    // Students can only see their own attempts
    const studentId = currentUser.role === "STUDENT" ? currentUser._id : null;
    const attempts = await dao.findAttemptsForQuiz(quizId, studentId);

    res.json(attempts);
  };

  // Register routes
  app.get("/api/courses/:courseId/quizzes", findQuizzesForCourse);
  app.post("/api/courses/:courseId/quizzes", createQuizForCourse);
  app.get("/api/quizzes/:quizId", findQuizById);
  app.put("/api/quizzes/:quizId", updateQuiz);
  app.delete("/api/quizzes/:quizId", deleteQuiz);
  app.put("/api/quizzes/:quizId/publish", togglePublishQuiz);

  app.get("/api/quizzes/:quizId/questions", findQuestionsForQuiz);
  app.post("/api/quizzes/:quizId/questions", createQuestion);
  app.put("/api/questions/:questionId", updateQuestion);
  app.delete("/api/questions/:questionId", deleteQuestion);

  app.post("/api/quizzes/:quizId/attempts", startAttempt);
  app.put("/api/attempts/:attemptId", submitAttempt);
  app.get("/api/quizzes/:quizId/attempts/latest", getLatestAttempt);
  app.get("/api/quizzes/:quizId/attempts", getAttempts);
}