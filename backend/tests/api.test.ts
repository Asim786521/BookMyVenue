import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

describe("api", () => {
  it("returns health", async () => {
    const res = await request(createApp()).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
