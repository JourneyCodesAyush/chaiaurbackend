import { beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
});

afterEach(async () => {
  const collections = Object.values(mongoose.connection.collections);
  const deletePromises = collections.map((collection) =>
    collection.deleteMany({})
  );
  await Promise.all(deletePromises);
});
