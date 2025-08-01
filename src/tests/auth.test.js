// tests/auth.test.js
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app"); // assuming app.js exports your Express app
const User = require("../models/User");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany(); // clear test users
});

describe("POST /api/auth/register", () => {
  it("should register a new user successfully", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "12345678",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("name", "John Doe");
    expect(res.body.data).not.toHaveProperty("password");
  });

  it("should fail if email already exists", async () => {
    await User.create({
      name: "Existing",
      email: "john@example.com",
      password: "12345678",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "12345678",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/already exists/);
  });

  it("should fail if fields are empty", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "",
      email: "",
      password: "",
    });

    expect(res.statusCode).toBe(400);
  });
});
