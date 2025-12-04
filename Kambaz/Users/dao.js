export default function UsersDao(db) {
  function findAllUsers() {
    return db.users;
  }

  function findUsersForCourse(courseId) {
    const { users, enrollments } = db;
    const enrolledUsers = users.filter((user) =>
      enrollments.some(
        (enrollment) =>
          enrollment.user === user._id && enrollment.course === courseId
      )
    );
    return enrolledUsers;
  }

  function findUserById(userId) {
    return db.users.find((user) => user._id === userId);
  }

  function createUser(user) {
    const newUser = { ...user, _id: new Date().getTime().toString() };
    db.users.push(newUser);
    return newUser;
  }

  function deleteUser(userId) {
    const { users, enrollments } = db;
    db.users = users.filter((user) => user._id !== userId);
    db.enrollments = enrollments.filter(
      (enrollment) => enrollment.user !== userId
    );
  }

  function updateUser(userId, userUpdates) {
    const { users } = db;
    const user = users.find((user) => user._id === userId);
    Object.assign(user, userUpdates);
    return user;
  }

  return {
    findAllUsers,
    findUsersForCourse,
    findUserById,
    createUser,
    deleteUser,
    updateUser,
  };
}