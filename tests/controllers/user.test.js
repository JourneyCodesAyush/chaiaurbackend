import { describe, it, expect } from "vitest";
import { vi } from "vitest";

import request from "supertest";
import { avatarPath } from "../fixtures/paths.js";
import { app } from "../../src/app.js";
import { buildUserPayload } from "../fixtures/user.factory.js";

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
});
