import { v4 as uuidv4 } from "uuid";

export default function CoursesDao(db) {
  function findAllCourses() {
    return db.courses;
  }

  function findCoursesForEnrolledUser(userId) {
    const { courses, enrollments } = db;
    console.log("DAO - Total enrollments:", enrollments.length);
    console.log("DAO - Looking for userId:", userId, "Type:", typeof userId);
    
    // Check first few enrollments
    enrollments.slice(0, 3).forEach(e => {
      console.log(`DAO - Enrollment: user=${e.user} (type: ${typeof e.user}), course=${e.course}`);
    });
    
    const enrolledCourses = courses.filter((course) =>
      enrollments.some(
        (enrollment) => enrollment.user === userId && enrollment.course === course._id
      )
    );
    console.log("DAO - Enrolled courses found:", enrolledCourses.length);
    return enrolledCourses;
  }

  function createCourse(course) {
    const newCourse = { ...course, _id: uuidv4() };
    db.courses = [...db.courses, newCourse];
    return newCourse;
  }

  function deleteCourse(courseId) {
    const { courses, enrollments } = db;
    db.courses = courses.filter((course) => course._id !== courseId);
    db.enrollments = enrollments.filter(
      (enrollment) => enrollment.course !== courseId
    );
  }

  function updateCourse(courseId, courseUpdates) {
    const { courses } = db;
    const course = courses.find((course) => course._id === courseId);
    Object.assign(course, courseUpdates);
    return course;
  }

  return {
    findAllCourses,
    findCoursesForEnrolledUser,
    createCourse,
    deleteCourse,
    updateCourse,
  };
}