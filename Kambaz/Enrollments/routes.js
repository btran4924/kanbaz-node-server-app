export default function EnrollmentsRoutes(app, db) {
  const findAllEnrollments = (req, res) => {
    res.json(db.enrollments);
  };

  app.get("/api/enrollments", findAllEnrollments);
}