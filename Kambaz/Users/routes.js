import UsersDao from "./dao.js";

export default function UserRoutes(app, db) {
  const dao = UsersDao(db);

  const signin = (req, res) => {
    const { username, password } = req.body;
    console.log("Signin attempt:", username);
    const currentUser = db.users.find(
      (user) => user.username === username && user.password === password
    );
    if (currentUser) {
      req.session["currentUser"] = currentUser;
      console.log("Session after signin:", req.session);
      console.log("User signed in:", currentUser._id);
      res.json(currentUser);
    } else {
      console.log("Login failed for:", username);
      res.status(401).json({ message: "Unable to login" });
    }
  };

  const profile = (req, res) => {
    console.log("Profile request - Session:", req.session);
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      console.log("No current user in session");
      res.sendStatus(401);
      return;
    }
    res.json(currentUser);
  };

  const signup = (req, res) => {
    const user = req.body;
    const existingUser = db.users.find((u) => u.username === user.username);
    if (existingUser) {
      res.status(400).json({ message: "Username already exists" });
      return;
    }
    const newUser = { ...user, _id: new Date().getTime().toString() };
    db.users.push(newUser);
    req.session["currentUser"] = newUser;
    res.json(newUser);
  };

  const signout = (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
  };

  const findAllUsers = (req, res) => {
    const users = dao.findAllUsers();
    res.json(users);
  };

  const findUsersForCourse = (req, res) => {
    const { courseId } = req.params;
    const users = dao.findUsersForCourse(courseId);
    res.json(users);
  };

  const createUser = (req, res) => {
    const newUser = dao.createUser(req.body);
    res.json(newUser);
  };

  const deleteUser = (req, res) => {
    const { userId } = req.params;
    dao.deleteUser(userId);
    res.sendStatus(204);
  };

  const updateUser = (req, res) => {
    const { userId } = req.params;
    const userUpdates = req.body;
    const user = dao.updateUser(userId, userUpdates);
    res.json(user);
  };

  app.post("/api/users/signin", signin);
  app.post("/api/users/signup", signup);
  app.post("/api/users/signout", signout);
  app.post("/api/users/profile", profile);
  app.get("/api/users", findAllUsers);
  app.get("/api/courses/:courseId/users", findUsersForCourse);
  app.post("/api/users", createUser);
  app.delete("/api/users/:userId", deleteUser);
  app.put("/api/users/:userId", updateUser);
}