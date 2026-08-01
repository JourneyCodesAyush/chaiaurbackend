import { describe, it, expect } from "vitest";
import { ApiError } from "../../src/utils/ApiError.js";

describe("ApiError", () => {
  it("sets the statusCode from the constructor argument", () => {
    const err = new ApiError(404, "not found");
    expect(err.statusCode).toBe(404);
  });

  it("sets default message", () => {
    const err = new ApiError(404);
    expect(err.message).toBe("Something went wrong");
  });

  it("defaults errors to an empty array", () => {
    const err = new ApiError(404);
    expect(err.errors).toEqual([]);
  });

  it("sets success is always false", () => {
    const err = new ApiError(404);
    expect(err.success).toBe(false);
  });

  it("sets data is null", () => {
    const err = new ApiError(404);
    expect(err.data).toBe(null);
  });
});
