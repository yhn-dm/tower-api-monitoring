import { describe, it, expect, vi, beforeEach } from "vitest";
import axios, { AxiosError } from "axios";
import { performHttpCheck } from "../../src/lib/httpCheck";

vi.mock("axios", async () => {
  const actual = await vi.importActual<typeof import("axios")>("axios");
  const fn = vi.fn();
  return {
    ...actual,
    default: fn,
  };
});

const mockedAxios = axios as unknown as vi.MockedFunction<typeof axios>;

describe("performHttpCheck", () => {
  beforeEach(() => {
    mockedAxios.mockReset();
  });

  it("returns UP status on successful response", async () => {
    mockedAxios.mockResolvedValue({
      status: 200,
      data: { ok: true },
    } as any);

    const result = await performHttpCheck("https://example.com", "GET");

    expect(result.status).toBe("UP");
    expect(result.httpStatus).toBe(200);
    expect(result.responseSizeBytes).toBeGreaterThan(0);
    expect(result.error).toBeNull();
  });

  it("returns TIMEOUT when axios aborts with ECONNABORTED", async () => {
    const err = new AxiosError("timeout", "ECONNABORTED");
    mockedAxios.mockRejectedValue(err);

    const result = await performHttpCheck("https://slow.example.com", "GET");

    expect(result.status).toBe("TIMEOUT");
    expect(result.httpStatus).toBeNull();
    expect(result.latencyMs).toBeNull();
    expect(result.error).toBe("Timeout");
  });

  it("returns ERROR when axios fails with another error", async () => {
    const err = new AxiosError("network failure");
    mockedAxios.mockRejectedValue(err);

    const result = await performHttpCheck("https://broken.example.com", "GET");

    expect(result.status).toBe("ERROR");
    expect(result.httpStatus).toBeNull();
    expect(result.latencyMs).toBeNull();
    expect(result.responseSizeBytes).toBe(0);
    expect(result.error).toContain("network");
  });

  it("returns ERROR on unknown thrown value", async () => {
    mockedAxios.mockRejectedValue("weird error");

    const result = await performHttpCheck("https://weird.example.com", "GET");

    expect(result.status).toBe("ERROR");
    expect(result.httpStatus).toBeNull();
    expect(result.latencyMs).toBeNull();
    expect(result.responseSizeBytes).toBe(0);
    expect(result.error).toContain("weird error");
  });

  it("returns UP with httpStatus 404 when server returns 404 (validateStatus: () => true)", async () => {
    mockedAxios.mockResolvedValue({
      status: 404,
      data: { error: "Not found" },
    } as any);

    const result = await performHttpCheck("https://example.com/absent", "GET");

    expect(result.status).toBe("UP");
    expect(result.httpStatus).toBe(404);
    expect(result.error).toBeNull();
  });

  it("returns UP with httpStatus 500 when server returns 500", async () => {
    mockedAxios.mockResolvedValue({
      status: 500,
      data: "Internal Server Error",
    } as any);

    const result = await performHttpCheck("https://example.com/error", "GET");

    expect(result.status).toBe("UP");
    expect(result.httpStatus).toBe(500);
    expect(result.error).toBeNull();
  });
});

