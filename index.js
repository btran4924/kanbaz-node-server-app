import express from "express";
import session from "express-session";
import Hello from "./Hello.js";
import Lab5 from "./Lab5/index.js";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModuleRoutes from "./Kambaz/Modules/routes.js";
import AssignmentRoutes from "./Kambaz/Assignments/routes.js";
import EnrollmentsRoutes from "./Kambaz/Enrollments/routes.js";
import db from "./Kambaz/Database/index.js";
import cors from "cors";
import "dotenv/config";

const app = express();

// CORS must be configured BEFORE session
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  })
);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "kambaz",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.SERVER_ENV !== "development",
      httpOnly: true,
      sameSite: process.env.SERVER_ENV !== "development" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000  // 24 hours
    }
  })
);

app.use(express.json());

UserRoutes(app, db);
CourseRoutes(app, db);
ModuleRoutes(app, db);
AssignmentRoutes(app, db);
EnrollmentsRoutes(app, db);
Lab5(app);
Hello(app);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on ${process.env.SERVER_URL || `http://localhost:${PORT}`}`);
});