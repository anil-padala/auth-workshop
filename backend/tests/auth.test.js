const bcrypt = require("bcrypt");
const request = require("supertest");
const app = require("../server");
const db = require("../database/db");

const email = `auth-workshop-${process.pid}-${Date.now()}@example.com`;
const password = "Secret123";
let registeredUser;

afterAll(() => {
  db.prepare("DELETE FROM users WHERE email = ?").run(email);
  db.close();
});

test("GWT 3 - invalid email or short password: register is called and 400 field errors are returned", async () => {
  const invalid = await request(app)
    .post("/api/register")
    .send({ email: "not-an-email", password: "short" });

  expect(invalid.status).toBe(400);
  expect(invalid.body.errors.email).toBeTruthy();
  expect(invalid.body.errors.password).toBeTruthy();

  const tooLong = await request(app)
    .post("/api/register")
    .send({ email, password: "A1".repeat(37) });

  expect(tooLong.status).toBe(400);
  expect(tooLong.body.errors.password).toMatch(/72 bytes/);
});

test("GWT 1 - valid new email and password: register creates a user and stores a password hash", async () => {
  const response = await request(app)
    .post("/api/register")
    .send({ email: `  ${email.toUpperCase()}  `, password });

  expect(response.status).toBe(201);
  expect(response.body.email).toBe(email);
  expect(response.body.createdAt).toBeTruthy();
  expect(Object.keys(response.body).sort()).toEqual(["createdAt", "email", "id"]);

  registeredUser = response.body;
  const stored = db
    .prepare("SELECT passwordHash FROM users WHERE email = ?")
    .get(email);
  expect(stored.passwordHash).not.toBe(password);
  await expect(bcrypt.compare(password, stored.passwordHash)).resolves.toBe(true);
});

test("GWT 2 - already-registered email: register returns 409 and does not create a duplicate", async () => {
  const response = await request(app)
    .post("/api/register")
    .send({ email: email.toUpperCase(), password });

  expect(response.status).toBe(409);
  expect(response.body.message).toMatch(/Email already in use/);
  expect(response.body.errors.email).toBeTruthy();
});

test("GWT 4 - registered user and correct password: login returns a timed token and session", async () => {
  const response = await request(app)
    .post("/api/login")
    .send({ email: ` ${email.toUpperCase()} `, password });

  expect(response.status).toBe(200);
  expect(response.body.token).toBeTruthy();
  expect(response.body.expiresIn).toBe(3600);
  expect(response.body.user).toEqual({ id: registeredUser.id, email });
  expect(response.headers["set-cookie"][0]).toMatch(/HttpOnly/);

  const cookie = response.headers["set-cookie"][0].split(";")[0];
  const session = await request(app).get("/api/session").set("Cookie", cookie);

  expect(session.status).toBe(200);
  expect(session.body.user.email).toBe(email);
  expect(session.body.user.passwordHash).toBeUndefined();
  expect(session.body.expiresIn).toBeGreaterThan(0);
});

test("GWT 5 - registered user and wrong password: login returns a generic 401 message", async () => {
  const wrongPassword = await request(app)
    .post("/api/login")
    .send({ email, password: "Incorrect123" });
  const unknownEmail = await request(app)
    .post("/api/login")
    .send({ email: "unknown@example.com", password });

  expect(wrongPassword.status).toBe(401);
  expect(unknownEmail.status).toBe(401);
  expect(wrongPassword.body.message).toBe("Invalid email or password");
  expect(unknownEmail.body.message).toBe(wrongPassword.body.message);
});

test("GWT 6 - stored hash and correct password: bcrypt verification returns true", async () => {
  const hash = await bcrypt.hash(password, 10);
  const roundTrip = await bcrypt.compare(password, hash);

  expect(roundTrip).toBe(true);
  await expect(bcrypt.compare("Incorrect123", hash)).resolves.toBe(false);
});