import { describe, it, expect } from "vitest";
import { vi } from "vitest";

import request from "supertest";
import { avatarPath } from "../fixtures/paths.js";
import { app } from "../../src/app.js";
import { buildUserPayload } from "../fixtures/user.factory.js";

import { registerTestUser } from "../helpers/register.js";

import { User } from "../../src/models/user.model.js";

vi.mock("../../src/utils/cloudinary.js");

describe("POST /api/v1/users/register", () => {
  it("registers a new user and returns the created user without password or refreshToken", async () => {
    const payload = buildUserPayload();
    const response = await request(app)
      .post("/api/v1/users/register")
      .field("fullName", payload.fullName)
      .field("email", payload.email)
      .field("username", payload.username)
      .field("password", payload.password)
      .attach("avatar", avatarPath);

    expect(response.status).toBe(201);
    expect(response.body.data.email).toBe(payload.email);
    expect(response.body.data.username).toBe(payload.username.toLowerCase());
    expect(response.body.data.fullName).toBe(payload.fullName);
    expect(response.body.data.password).toBeUndefined();
    expect(response.body.data.refreshToken).toBeUndefined();
    expect(response.body.data.accessToken).toBeUndefined();
  });

  it("fails with 400 when fullName is an empty string", async () => {
    const payload = buildUserPayload();
    const response = await request(app)
      .post("/api/v1/users/register")
      .field("fullName", "")
      .field("username", payload.username)
      .field("email", payload.email)
      .field("password", payload.password)
      .attach("avatar", avatarPath);

    expect(response.status).toBe(400);
  });

  it("fails with 400 when username is an empty string", async () => {
    const payload = buildUserPayload();
    const response = await request(app)
      .post("/api/v1/users/register")
      .field("fullName", payload.fullName)
      .field("username", "")
      .field("email", payload.email)
      .field("password", payload.password)
      .attach("avatar", avatarPath);

    expect(response.status).toBe(400);
  });

  it("fails with 400 when email is an empty string", async () => {
    const payload = buildUserPayload();
    const response = await request(app)
      .post("/api/v1/users/register")
      .field("fullName", payload.fullName)
      .field("username", payload.username)
      .field("email", "")
      .field("password", payload.password)
      .attach("avatar", avatarPath);

    expect(response.status).toBe(400);
  });

  it("fails with 400 when password is an empty string", async () => {
    const payload = buildUserPayload();
    const response = await request(app)
      .post("/api/v1/users/register")
      .field("fullName", payload.fullName)
      .field("username", payload.username)
      .field("email", payload.email)
      .field("password", "")
      .attach("avatar", avatarPath);

    expect(response.status).toBe(400);
  });

  it("fails with 400 when avatar is not attached", async () => {
    const payload = buildUserPayload();
    const response = await request(app)
      .post("/api/v1/users/register")
      .field("fullName", payload.fullName)
      .field("username", payload.username)
      .field("email", payload.email)
      .field("password", payload.password);

    expect(response.status).toBe(400);
  });

  it("fails with 400 when fullName is ommitted", async () => {
    const payload = buildUserPayload();
    const response = await request(app)
      .post("/api/v1/users/register")
      .field("username", payload.username)
      .field("email", payload.email)
      .field("password", payload.password)
      .attach("avatar", avatarPath);

    expect(response.status).toBe(400);
  });

  it("fails with 400 when username is ommitted", async () => {
    const payload = buildUserPayload();
    const response = await request(app)
      .post("/api/v1/users/register")
      .field("fullName", payload.fullName)
      .field("email", payload.email)
      .field("password", payload.password)
      .attach("avatar", avatarPath);

    expect(response.status).toBe(400);
  });

  it("fails with 400 when email is ommitted", async () => {
    const payload = buildUserPayload();
    const response = await request(app)
      .post("/api/v1/users/register")
      .field("fullName", payload.fullName)
      .field("username", payload.username)
      .field("password", payload.password)
      .attach("avatar", avatarPath);

    expect(response.status).toBe(400);
  });

  it("fails with 400 when password is ommitted", async () => {
    const payload = buildUserPayload();
    const response = await request(app)
      .post("/api/v1/users/register")
      .field("fullName", payload.fullName)
      .field("username", payload.username)
      .field("email", payload.email)
      .attach("avatar", avatarPath);

    expect(response.status).toBe(400);
  });

  it("fails with 409 when email is already registered", async () => {
    const payload = buildUserPayload();
    const response = await request(app)
      .post("/api/v1/users/register")
      .field("fullName", payload.fullName)
      .field("email", payload.email)
      .field("username", payload.username)
      .field("password", payload.password)
      .attach("avatar", avatarPath);

    const secondPayload = buildUserPayload({ email: payload.email });
    const response2 = await request(app)
      .post("/api/v1/users/register")
      .field("fullName", secondPayload.fullName)
      .field("username", secondPayload.username)
      .field("email", secondPayload.email)
      .field("password", secondPayload.password)
      .attach("avatar", avatarPath);

    expect(response.status).toBe(201);
    expect(response2.status).toBe(409);
  });

  it("fails with 409 when username is already registered", async () => {
    const payload = buildUserPayload();
    const response = await request(app)
      .post("/api/v1/users/register")
      .field("fullName", payload.fullName)
      .field("email", payload.email)
      .field("username", payload.username)
      .field("password", payload.password)
      .attach("avatar", avatarPath);

    const secondPayload = buildUserPayload({ username: payload.username });
    const response2 = await request(app)
      .post("/api/v1/users/register")
      .field("fullName", secondPayload.fullName)
      .field("username", secondPayload.username)
      .field("email", secondPayload.email)
      .field("password", secondPayload.password)
      .attach("avatar", avatarPath);

    expect(response.status).toBe(201);
    expect(response2.status).toBe(409);
  });
});

describe("POST /api/v1/users/login", () => {
  it("logs in successfully with correct credentials", async () => {
    const { payload, registerResponse } = await registerTestUser();

    expect(registerResponse.status).toBe(201);

    const loginResult = await request(app).post("/api/v1/users/login").send({
      username: payload.username,
      email: payload.email,
      password: payload.password,
    });

    const cookies = loginResult.headers["set-cookie"];

    expect(loginResult.status).toBe(200);
    expect(loginResult.body.data.user.refreshToken).toBeUndefined();
    expect(loginResult.body.data.refreshToken).toBeDefined();
    expect(loginResult.body.data.accessToken).toBeDefined();
    expect(cookies.some((c) => c.startsWith("accessToken="))).toBe(true);
    expect(cookies.some((c) => c.startsWith("refreshToken="))).toBe(true);

    const dbUser = await User.findById(loginResult.body.data.user._id);
    expect(dbUser.refreshToken).toBe(loginResult.body.data.refreshToken);
  });

  it("logs in successfully with only username and password", async () => {
    const { payload, registerResponse } = await registerTestUser();

    expect(registerResponse.status).toBe(201);

    const loginResult = await request(app).post("/api/v1/users/login").send({
      username: payload.username,
      password: payload.password,
    });

    const cookies = loginResult.headers["set-cookie"];

    expect(loginResult.status).toBe(200);
    expect(loginResult.body.data.user.refreshToken).toBeUndefined();
    expect(loginResult.body.data.refreshToken).toBeDefined();
    expect(loginResult.body.data.accessToken).toBeDefined();
    expect(cookies.some((c) => c.startsWith("accessToken="))).toBe(true);
    expect(cookies.some((c) => c.startsWith("refreshToken="))).toBe(true);

    const dbUser = await User.findById(loginResult.body.data.user._id);
    expect(dbUser.refreshToken).toBe(loginResult.body.data.refreshToken);
  });

  it("logs in successfully with only email and password", async () => {
    const { payload, registerResponse } = await registerTestUser();

    expect(registerResponse.status).toBe(201);

    const loginResult = await request(app).post("/api/v1/users/login").send({
      email: payload.email,
      password: payload.password,
    });

    const cookies = loginResult.headers["set-cookie"];

    expect(loginResult.status).toBe(200);
    expect(loginResult.body.data.user.refreshToken).toBeUndefined();
    expect(loginResult.body.data.refreshToken).toBeDefined();
    expect(loginResult.body.data.accessToken).toBeDefined();
    expect(cookies.some((c) => c.startsWith("accessToken="))).toBe(true);
    expect(cookies.some((c) => c.startsWith("refreshToken="))).toBe(true);

    const dbUser = await User.findById(loginResult.body.data.user._id);
    expect(dbUser.refreshToken).toBe(loginResult.body.data.refreshToken);
  });

  it("login fails when both email and username are missing", async () => {
    const loginResult = await request(app).post("/api/v1/users/login").send({
      password: "placeholder",
    });

    expect(loginResult.status).toBe(400);
  });

  it("login fails with unknown user", async () => {
    const loginResult = await request(app).post("/api/v1/users/login").send({
      username: "userDoesNotExist",
      email: "incorrectEmail",
      password: "randomPassword",
    });

    expect(loginResult.status).toBe(404);
  });

  it("login fails with wrong password", async () => {
    const { payload, registerResponse } = await registerTestUser();

    expect(registerResponse.status).toBe(201);

    const loginResult = await request(app).post("/api/v1/users/login").send({
      username: payload.username,
      email: payload.email,
      password: "wrongPassword",
    });

    expect(loginResult.status).toBe(401);
  });
});
