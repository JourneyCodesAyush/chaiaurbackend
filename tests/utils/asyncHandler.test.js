import { describe, expect, it, vi } from "vitest";

import { asyncHandler } from "../../src/utils/asyncHandler.js";

describe("asyncHandler", () => {
  it("success path", async () => {
    const next = vi.fn();
    const requestHandler = vi.fn().mockResolvedValue("some result");

    const wrapped = asyncHandler(requestHandler);
    await wrapped({}, {}, next);

    expect(next).not.toHaveBeenCalled();
  });

  it("failure path", async () => {
    const next = vi.fn();
    const error = new Error("boom");
    const requestHandler = vi.fn().mockRejectedValue(error);

    const wrapped = asyncHandler(requestHandler);
    await wrapped({}, {}, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
