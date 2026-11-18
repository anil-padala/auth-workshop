const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getSession,
  logout
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/session", getSession);
router.post("/logout", logout);

router.get("/", (_req, res) => {
  res.json({
    message: "Authentication API Running"
  });
});

module.exports = router;