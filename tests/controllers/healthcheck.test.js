import request from "supertest";
import { app } from "../../src/app.js";
import { describe, it, expect } from "vitest";

describe("health check", () => {
  it("returns 200 for GET /api/v1/healthcheck", async () => {
    const response = await request(app).get("/api/v1/healthcheck");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBe(null);
  });
});
