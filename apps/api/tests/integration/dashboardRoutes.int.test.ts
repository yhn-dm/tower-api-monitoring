import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createServer } from "../../src/app";

let app: ReturnType<typeof createServer>;

beforeAll(() => {
  app = createServer();
});

describe("GET /dashboard", () => {
  it("responds with 200 and an array", async () => {
    const res = await request(app).get("/dashboard");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("GET /providers/:slug", () => {
  it("returns 404 for an unknown provider", async () => {
    const res = await request(app).get("/providers/__unknown__");
    expect(res.status).toBe(404);
  });
});

