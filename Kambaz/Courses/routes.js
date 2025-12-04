import CoursesDao from "./dao.js";
import EnrollmentsDao from "../Enrollments/dao.js";

export default function CourseRoutes(app, db) {
  const dao = CoursesDao(db);
  const enrollmentsDao = EnrollmentsDao(db);

  const findAllCourses = (req, res) => {
    const courses = dao.findAllCourses();
    res.send(courses);
  };

  const findCoursesForEnrolledUser = (req, res) => {
    let { userId } = req.params;
    console.log("1. Initial userId from params:", userId);
    if (userId === "current") {
      const currentUser = req.session["currentUser"];
      console.log("2. Current user from session:", currentUser);
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      userId = currentUser._id;
      console.log("3. Resolved userId:", userId);
    }
    const courses = dao.findCoursesForEnrolledUser(userId);
    console.log("4. Courses found:", courses.length);
    res.json(courses);
  };

  const createCourse = (req, res) => {
    const currentUser = req.session["currentUser"];
    const newCourse = dao.createCourse(req.body);
    enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
    res.json(newCourse);
  };

  const deleteCourse = (req, res) => {
    const { courseId } = req.params;
    const status = dao.deleteCourse(courseId);
    res.send(status);
  };

  const updateCourse = (req, res) => {
    const { courseId } = req.params;
    const courseUpdates = req.body;
    const status = dao.updateCourse(courseId, courseUpdates);
    res.send(status);
  };

  const enrollInCourse = (req, res) => {
    let { userId, courseId } = req.params;
    console.log("Enrolling - userId:", userId, "courseId:", courseId);
    if (userId === "current") {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      userId = currentUser._id;
    }
    enrollmentsDao.enrollUserInCourse(userId, courseId);
    console.log("Enrollment complete for user:", userId);
    res.sendStatus(200);
  };

  const unenrollFromCourse = (req, res) => {
    let { userId, courseId } = req.params;
    console.log("Unenrolling - userId:", userId, "courseId:", courseId);
    if (userId === "current") {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      userId = currentUser._id;
    }
    enrollmentsDao.unenrollUserFromCourse(userId, courseId);
    console.log("Unenrollment complete for user:", userId);
    res.sendStatus(200);
  };

  app.get("/api/courses", findAllCourses);
  app.get("/api/users/:userId/courses", findCoursesForEnrolledUser);
  app.post("/api/users/current/courses", createCourse);
  app.delete("/api/courses/:courseId", deleteCourse);
  app.put("/api/courses/:courseId", updateCourse);
  app.post("/api/users/:userId/courses/:courseId", enrollInCourse);
  app.delete("/api/users/:userId/courses/:courseId", unenrollFromCourse);
}