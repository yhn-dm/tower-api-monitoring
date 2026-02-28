import { describe, it, expect, vi, beforeEach } from "vitest";
import { evaluateProviderIncident } from "../../src/lib/incidentDetector";

vi.mock("@tower/db", () => ({
  prisma: {
    endpoint: {
      findMany: vi.fn(),
    },
    incidentEvent: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@tower/db";

describe("evaluateProviderIncident", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing when there are no endpoints", async () => {
    (prisma.endpoint.findMany as any).mockResolvedValue([]);

    await evaluateProviderIncident(1);

    expect(prisma.incidentEvent.create).not.toHaveBeenCalled();
    expect(prisma.incidentEvent.update).not.toHaveBeenCalled();
  });

  it("opens an incident when at least one endpoint is down and no open incident exists", async () => {
    (prisma.endpoint.findMany as any).mockResolvedValue([
      { id: 1, providerId: 1, checks: [{ status: "DOWN" }] },
    ]);
    (prisma.incidentEvent.findFirst as any).mockResolvedValue(null);

    await evaluateProviderIncident(1);

    expect(prisma.incidentEvent.create).toHaveBeenCalledTimes(1);
    const args = (prisma.incidentEvent.create as any).mock.calls[0][0];
    expect(args.data.providerId).toBe(1);
    expect(args.data.type).toBe("DOWN");
  });

  it("closes an incident when provider is healthy again", async () => {
    (prisma.endpoint.findMany as any).mockResolvedValue([
      { id: 1, providerId: 1, checks: [{ status: "UP" }] },
    ]);
    (prisma.incidentEvent.findFirst as any).mockResolvedValue({
      id: 42,
      providerId: 1,
      startAt: new Date(),
      endAt: null,
    });

    await evaluateProviderIncident(1);

    expect(prisma.incidentEvent.update).toHaveBeenCalledTimes(1);
    const args = (prisma.incidentEvent.update as any).mock.calls[0][0];
    expect(args.where.id).toBe(42);
    expect(args.data.endAt).toBeInstanceOf(Date);
  });

  it("keeps incident state unchanged when provider remains down and incident already open", async () => {
    (prisma.endpoint.findMany as any).mockResolvedValue([
      { id: 1, providerId: 1, checks: [{ status: "ERROR" }] },
    ]);
    (prisma.incidentEvent.findFirst as any).mockResolvedValue({
      id: 42,
      providerId: 1,
      startAt: new Date(),
      endAt: null,
    });

    await evaluateProviderIncident(1);

    expect(prisma.incidentEvent.create).not.toHaveBeenCalled();
    expect(prisma.incidentEvent.update).not.toHaveBeenCalled();
  });

  it("opens SLOW incident when latency is high and no open incident", async () => {
    (prisma.endpoint.findMany as any).mockResolvedValue([
      { id: 1, providerId: 1, checks: [{ status: "UP", latencyMs: 3000 }] },
    ]);
    (prisma.incidentEvent.findFirst as any).mockResolvedValue(null);

    await evaluateProviderIncident(1);

    expect(prisma.incidentEvent.create).toHaveBeenCalledTimes(1);
    const args = (prisma.incidentEvent.create as any).mock.calls[0][0];
    expect(args.data.type).toBe("SLOW");
    expect(args.data.message).toContain("latency");
  });

  it("closes incident when provider has no problem (all UP, low latency)", async () => {
    (prisma.endpoint.findMany as any).mockResolvedValue([
      { id: 1, providerId: 1, checks: [{ status: "UP", latencyMs: 50 }] },
    ]);
    (prisma.incidentEvent.findFirst as any).mockResolvedValue({
      id: 42,
      providerId: 1,
      startAt: new Date(),
      endAt: null,
    });

    await evaluateProviderIncident(1);

    expect(prisma.incidentEvent.update).toHaveBeenCalledTimes(1);
    expect(prisma.incidentEvent.create).not.toHaveBeenCalled();
  });
});

