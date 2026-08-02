import { describe, it, expect } from "vitest";
import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  number: { type: Number },
  words: { type: String },
});

const TestWidget = mongoose.model("TestWidget", testSchema);

describe("MongoMemoryServer connection", () => {
  it("persists a document that can be found in the same test", async () => {
    await TestWidget.create({ number: 100, words: "one hundred" });

    const doc = await TestWidget.findOne({ number: 100 });
    expect(doc.number).toBe(100);
    expect(doc.words).toBe("one hundred");
  });

  it("does not see documents created in previous tests", async () => {
    const doc = await TestWidget.findOne({ number: 100 });
    expect(doc).toBe(null);
  });
});
