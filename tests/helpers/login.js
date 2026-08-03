import request from "supertest";
import { app } from "../../src/app.js";
import { registerTestUser } from "./register.js";

export async function loginTestUser(overrides = {}) {
  const { payload, registerResponse } = await registerTestUser(overrides);

  const loginResult = await request(app).post("/api/v1/users/login").send({
    username: payload.username,
    email: payload.email,
    password: payload.password,
  });

  return { payload, registerResponse, loginResult };
}
