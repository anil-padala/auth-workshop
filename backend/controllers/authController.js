const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database/db");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PASSWORD_BYTES = 72;
const TOKEN_EXPIRY_SECONDS = 3600;
const DUMMY_PASSWORD_HASH = bcrypt.hashSync("dummy-login-password", 10);

function validateCredentials(body, isRegistration) {
  const input =
    body && typeof body === "object" && !Array.isArray(body) ? body : {};
  const errors = {};

  let email = "";
  if (typeof input.email !== "string" || !input.email.trim()) {
    errors.email = "Email is required.";
  } else {
    email = input.email.trim().toLowerCase();
    if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
      errors.email = "Enter a valid email address.";
    }
  }

  const password = input.password;
  if (typeof password !== "string" || password.length === 0) {
    errors.password = "Password is required.";
  } else if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
    errors.password = "Password must be no more than 72 bytes.";
  } else if (isRegistration && password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  } else if (
    isRegistration &&
    (!/[A-Za-z]/.test(password) || !/\d/.test(password))
  ) {
    errors.password = "Password must contain at least one letter and one number.";
  }

  return { email, password, errors };
}

function validationError(res, errors) {
  return res.status(400).json({
    message: "Please correct the highlighted fields.",
    errors
  });
}

function toIsoTimestamp(timestamp) {
  return new Date(`${timestamp.replace(" ", "T")}Z`).toISOString();
}

function safeUser(user) {
  return {
    id: user.id,
    email: user.email,
    createdAt: toIsoTimestamp(user.createdAt)
  };
}

function setAuthCookie(res, token, maxAge) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `auth_token=${token}; HttpOnly; Path=/api; SameSite=Lax; Max-Age=${maxAge}${secure}`
  );
}

function getAuthCookie(req) {
  const cookies = req.headers.cookie || "";
  const cookie = cookies
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("auth_token="));

  return cookie ? cookie.slice("auth_token=".length) : null;
}

const register = async (req, res) => {
  try {
    const { email, password, errors } = validateCredentials(req.body, true);
    if (Object.keys(errors).length > 0) {
      return validationError(res, errors);
    }

    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);

    if (existingUser) {
      return res.status(409).json({
        message: "Email already in use.",
        errors: { email: "Email already in use." }
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = db
      .prepare(
        `
        INSERT INTO users (email, passwordHash)
        VALUES (?, ?)
      `
      )
      .run(email, passwordHash);
    const user = db
      .prepare("SELECT id, email, createdAt FROM users WHERE id = ?")
      .get(result.lastInsertRowid);

    return res.status(201).json({
      ...safeUser(user)
    });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        message: "Email already in use.",
        errors: { email: "Email already in use." }
      });
    }
    console.error("Registration failed:", error.code || error.name);
    return res.status(500).json({
      message: "Server error."
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, errors } = validateCredentials(req.body, false);
    if (Object.keys(errors).length > 0) {
      return validationError(res, errors);
    }

    const user = db
      .prepare("SELECT id, email, passwordHash, createdAt FROM users WHERE email = ?")
      .get(email);

    const validPassword = await bcrypt.compare(
      password,
      user ? user.passwordHash : DUMMY_PASSWORD_HASH
    );

    if (!user || !validPassword) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: TOKEN_EXPIRY_SECONDS
      }
    );
    setAuthCookie(res, token, TOKEN_EXPIRY_SECONDS);

    return res.status(200).json({
      token,
      expiresIn: TOKEN_EXPIRY_SECONDS,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login failed:", error.code || error.name);
    return res.status(500).json({
      message: "Server error."
    });
  }
};

const getSession = (req, res) => {
  const token = getAuthCookie(req);
  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Authentication required." });
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    !Number.isInteger(payload.id) ||
    !Number.isInteger(payload.exp)
  ) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const user = db
      .prepare("SELECT id, email, createdAt FROM users WHERE id = ?")
      .get(payload.id);
    if (!user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    return res.status(200).json({
      user: safeUser(user),
      expiresIn: Math.max(0, payload.exp - Math.floor(Date.now() / 1000))
    });
  } catch (error) {
    console.error("Session lookup failed:", error.code || error.name);
    return res.status(500).json({ message: "Server error." });
  }
};

const logout = (req, res) => {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `auth_token=; HttpOnly; Path=/api; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secure}`
  );
  return res.status(200).json({ message: "Logged out." });
};

module.exports = {
  register,
  login,
  getSession,
  logout
};