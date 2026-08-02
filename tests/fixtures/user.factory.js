import crypto from "crypto";

export function buildUserPayload(overrides = {}) {
  const defaults = {
    fullName: crypto.randomUUID(),
    email: `user_${crypto.randomUUID()}@example.com`,
    username: crypto.randomUUID(),
    password: crypto.randomUUID(),
  };

  return { ...defaults, ...overrides };
}
