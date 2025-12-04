import EnrollmentsDao from "./dao.js";

export default function EnrollmentsRoutes(app, db) {
  const dao = EnrollmentsDao(db);
  
  const findAllEnrollments = async (req, res) => {
    const enrollments = await dao.findAllEnrollments();
    res.json(enrollments);
  };

  app.get("/api/enrollments", findAllEnrollments);
}