require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json({ limit: "10kb" }));

app.use("/api", authRoutes);

app.use((error, _req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Invalid JSON request body.",
      errors: {}
    });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({
      message: "Request body is too large.",
      errors: {}
    });
  }
  return next(error);
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be set before starting the server.");
  }
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;