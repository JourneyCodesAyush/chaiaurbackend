import { MongoMemoryServer } from "mongodb-memory-server";
import dotenv from "dotenv";

export default async function setup(project) {
  dotenv.config({ path: ".env.test" });

  const mongoServer = await MongoMemoryServer.create();

  const uri = mongoServer.getUri();

  process.env["MONGODB_URI"] = uri;

  return async function teardown() {
    await mongoServer.stop();
  };
}
