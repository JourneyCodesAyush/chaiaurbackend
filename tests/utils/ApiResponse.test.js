import { describe, it, expect } from "vitest";
import { ApiResponse } from "../../src/utils/ApiResponse.js";

describe("ApiResponse", () => {
  it("marks statusCode below 400 as success", () => {
    const res = new ApiResponse(200, { id: 1 });
    expect(res.success).toBe(true);
  });

  it("sets success is false for 404", () => {
    const res = new ApiResponse(404, { id: 1 });
    expect(res.success).toBe(false);
  });

  it("sets success is false for 400", () => {
    const res = new ApiResponse(400, { id: 1 });
    expect(res.success).toBe(false);
  });

  it("defaults message is success", () => {
    const res = new ApiResponse(400, { id: 1 });
    expect(res.message).toBe("Success");
  });

  it("stores an object reference as-is", () => {
    const inputData = { id: 1 };
    const res = new ApiResponse(200, inputData);
    expect(res.data).toBe(inputData);
  });

  it("stores an array reference as-is", () => {
    const inputData = [1, 2, 3];
    const res = new ApiResponse(200, inputData);
    expect(res.data).toBe(inputData);
  });
});
