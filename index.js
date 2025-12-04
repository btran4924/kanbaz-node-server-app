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

const app = express();

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000", 
  })
);

app.use(
  session({
    secret: "kambaz",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,       
      httpOnly: true,
      sameSite: "lax",      
      maxAge: 24 * 60 * 60 * 1000
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

app.listen(process.env.PORT || 4000);