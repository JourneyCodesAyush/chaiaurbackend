import { MongoMemoryServer } from "mongodb-memory-server";

export default async function setup(project) {
  const mongoServer = await MongoMemoryServer.create();

  const uri = mongoServer.getUri();

  process.env["MONGODB_URI"] = uri;

  return async function teardown() {
    await mongoServer.stop();
  };
}
