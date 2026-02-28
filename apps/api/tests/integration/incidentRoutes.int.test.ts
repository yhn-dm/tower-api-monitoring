import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createServer } from "../../src/app";

let app: ReturnType<typeof createServer>;

beforeAll(() => {
  app = createServer();
});

describe("GET /incidents", () => {
  it("returns an array (possibly empty)", async () => {
    const res = await request(app).get("/incidents");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("supports provider-specific endpoint /incidents/:providerId", async () => {
    const res = await request(app).get("/incidents/123");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

