import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

import jwt from "jsonwebtoken";
import mongoose from "mongoose";

describe("verifyJWT middleware", () => {
  it("rejects request with no token with 401 and 'Unauthorized request' message", async () => {
    const res = await request(app).get("/api/v1/users/current-user");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Unauthorized request");
  });

  it("rejects request with garbage token with 401 and 'Unauthorized request' message", async () => {
    const res = await request(app)
      .get("/api/v1/users/current-user")
      .set("Cookie", ["accessToken=some.garbage.value"]);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("invalid token");
  });

  it("rejects request with token signed with wrong secret", async () => {
    const sign = jwt.sign(
      { _id: new mongoose.Types.ObjectId() },
      "wrong-secret"
    );

    const res = await request(app)
      .get("/api/v1/users/current-user")
      .set("Cookie", [`accessToken=${sign}`]);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("invalid signature");
  });

  it("rejects request with expired token", async () => {
    const sign = jwt.sign(
      { _id: new mongoose.Types.ObjectId() },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "-10s",
      }
    );

    const res = await request(app)
      .get("/api/v1/users/current-user")
      .set("Cookie", [`accessToken=${sign}`]);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("jwt expired");
  });

  it("rejects request with valid token for nonexistent user", async () => {
    const sign = jwt.sign(
      { _id: new mongoose.Types.ObjectId() },
      process.env.ACCESS_TOKEN_SECRET
    );

    const res = await request(app)
      .get("/api/v1/users/current-user")
      .set("Cookie", [`accessToken=${sign}`]);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User not found");
  });
});
