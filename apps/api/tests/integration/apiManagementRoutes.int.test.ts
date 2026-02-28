import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createServer } from "../../src/app";

let app: ReturnType<typeof createServer>;

beforeAll(() => {
  app = createServer();
});

describe("GET /api-management/providers", () => {
  it("responds with 200 and an array", async () => {
    const res = await request(app).get("/api-management/providers");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("POST /api-management/providers", () => {
  it("returns 400 when slug is missing", async () => {
    const res = await request(app)
      .post("/api-management/providers")
      .send({ name: "Test" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("code", "VALIDATION_ERROR");
    expect(res.body).toHaveProperty("details");
  });

  it("returns 400 when slug format is invalid", async () => {
    const res = await request(app)
      .post("/api-management/providers")
      .send({ slug: "Invalid Slug!", name: "Test" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("code", "VALIDATION_ERROR");
  });
});

describe("GET /api-management/providers/:id", () => {
  it("returns 400 for invalid id", async () => {
    const res = await request(app).get("/api-management/providers/abc");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("code", "VALIDATION_ERROR");
  });

  it("returns 404 for non-existent provider", async () => {
    const res = await request(app).get("/api-management/providers/999999");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("code", "PROVIDER_NOT_FOUND");
  });
});

describe("PUT /api-management/providers/:id", () => {
  it("returns 400 for invalid id", async () => {
    const res = await request(app)
      .put("/api-management/providers/0")
      .send({ name: "Updated" });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api-management/providers/:id", () => {
  it("returns 400 for invalid id", async () => {
    const res = await request(app).delete("/api-management/providers/abc");
    expect(res.status).toBe(400);
  });
});

describe("POST /api-management/providers/:id/endpoints", () => {
  it("returns 400 for invalid provider id", async () => {
    const res = await request(app)
      .post("/api-management/providers/abc/endpoints")
      .send({ url: "https://example.com" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when url is missing", async () => {
    const res = await request(app)
      .post("/api-management/providers/1/endpoints")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("code", "VALIDATION_ERROR");
  });
});

describe("PUT /api-management/endpoints/:id", () => {
  it("returns 400 for invalid id", async () => {
    const res = await request(app)
      .put("/api-management/endpoints/abc")
      .send({ url: "https://example.com" });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api-management/endpoints/:id", () => {
  it("returns 400 for invalid id", async () => {
    const res = await request(app).delete("/api-management/endpoints/abc");
    expect(res.status).toBe(400);
  });
});

describe("Error handling (phase 2.8)", () => {
  it("unknown route returns 404 with uniform error body", async () => {
    const res = await request(app).get("/unknown-route-xyz");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("code", "NOT_FOUND");
    expect(res.body).toHaveProperty("message");
  });
});
