import { describe, it, expect, vi, beforeEach } from "vitest";
import { runMonitoringTickOnce } from "../../src/runtime/tick";

vi.mock("../../src/infra/db", () => ({
  prisma: {
    endpoint: {
      findMany: vi.fn(),
    },
    checkResult: {
      create: vi.fn(),
    },
  },
}));

vi.mock("../../src/lib/httpCheck", () => ({
  performHttpCheck: vi.fn(async () => ({
    status: "UP",
    httpStatus: 200,
    latencyMs: 123,
    responseSizeBytes: 42,
    error: null,
  })),
}));

vi.mock("../../src/lib/incidentDetector", () => ({
  evaluateProviderIncident: vi.fn(),
}));

import { prisma } from "../../src/infra/db";
import { performHttpCheck } from "../../src/lib/httpCheck";
import { evaluateProviderIncident } from "../../src/lib/incidentDetector";

describe("runMonitoringTickOnce (integration-ish)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads enabled endpoints, runs checks and records results", async () => {
    (prisma.endpoint.findMany as any).mockResolvedValue([
      {
        id: 1,
        providerId: 10,
        provider: { id: 10, name: "Test Provider" },
        url: "https://example.com",
        method: "GET",
        region: "eu-west-1",
        isEnabled: true,
      },
      {
        id: 2,
        providerId: 20,
        provider: { id: 20, name: "Another Provider" },
        url: "https://example.org",
        method: "GET",
        region: null,
        isEnabled: true,
      },
    ]);

    await runMonitoringTickOnce();

    expect(prisma.endpoint.findMany).toHaveBeenCalled();
    expect(performHttpCheck).toHaveBeenCalledTimes(2);
    expect(prisma.checkResult.create).toHaveBeenCalledTimes(2);

    // we pass unique provider IDs so each provider is evaluated once
    expect(evaluateProviderIncident).toHaveBeenCalledTimes(2);
    const providerIds = (evaluateProviderIncident as any).mock.calls.map(
      (c: any[]) => c[0],
    );
    expect(new Set(providerIds)).toEqual(new Set([10, 20]));
  });

  it("logs and returns early when endpoints cannot be loaded", async () => {
    (prisma.endpoint.findMany as any).mockRejectedValue(
      new Error("DB connection error"),
    );

    await runMonitoringTickOnce();

    expect(performHttpCheck).not.toHaveBeenCalled();
    expect(prisma.checkResult.create).not.toHaveBeenCalled();
    expect(evaluateProviderIncident).not.toHaveBeenCalled();
  });
});

