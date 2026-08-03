import request from "supertest";
import { avatarPath } from "../fixtures/paths.js";
import { app } from "../../src/app.js";
import { buildUserPayload } from "../fixtures/user.factory.js";

export async function registerTestUser(overrides = {}) {
  const payload = buildUserPayload(overrides);

  const registerResponse = await request(app)
    .post("/api/v1/users/register")
    .field("fullName", payload.fullName)
    .field("email", payload.email)
    .field("username", payload.username)
    .field("password", payload.password)
    .attach("avatar", avatarPath);

  return { payload, registerResponse };
}
