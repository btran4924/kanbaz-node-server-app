import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export default function EnrollmentsDao(db) {
  async function findCoursesForUser(userId) {
    const enrollments = await model.find({ user: userId }).populate("course");
    return enrollments
      .map((enrollment) => enrollment.course)
      .filter((course) => course !== null);
  }

  async function findUsersForCourse(courseId) {
    const enrollments = await model.find({ course: courseId }).populate("user");
    return enrollments
      .map((enrollment) => enrollment.user)
      .filter((user) => user !== null);  // Filter out null users
  }

  async function enrollUserInCourse(userId, courseId) {
    const existingEnrollment = await model.findOne({ user: userId, course: courseId });
    if (existingEnrollment) {
      return existingEnrollment;
    }
    
    return model.create({
      _id: `${userId}-${courseId}`,
      user: userId,
      course: courseId,
    });
  }

  function unenrollUserFromCourse(userId, courseId) {
    return model.deleteOne({ user: userId, course: courseId });
  }

  function unenrollAllUsersFromCourse(courseId) {
    return model.deleteMany({ course: courseId });
  }

  function findAllEnrollments() {
    return model.find();
  }

  return {
    findCoursesForUser,
    findUsersForCourse,
    enrollUserInCourse,
    unenrollUserFromCourse,
    unenrollAllUsersFromCourse,
    findAllEnrollments,
  };
}