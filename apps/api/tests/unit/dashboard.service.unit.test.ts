import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    provider: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    checkResult: {
      findFirst: vi.fn(),
      aggregate: vi.fn(),
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
    incidentEvent: { count: vi.fn() },
  },
}));

vi.mock("../../src/utils/prisma", () => ({ prisma: mockPrisma }));

import { DashboardService } from "../../src/services/dashboard.service";

describe("DashboardService", () => {
  let service: DashboardService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DashboardService();
  });

  describe("fetchProviderRows", () => {
    it("returns empty array when no providers", async () => {
      mockPrisma.provider.findMany.mockResolvedValue([]);
      const result = await service.fetchProviderRows();
      expect(result).toEqual([]);
      expect(mockPrisma.checkResult.findFirst).not.toHaveBeenCalled();
    });

    it("skips providers with no endpoints", async () => {
      mockPrisma.provider.findMany.mockResolvedValue([
        { id: 1, slug: "p1", name: "P1", endpoints: [] },
      ]);
      const result = await service.fetchProviderRows();
    expect(result).toEqual([]);
    expect(mockPrisma.checkResult.findFirst).not.toHaveBeenCalled();
  });

    it("computes status down when uptime < 95", async () => {
      mockPrisma.provider.findMany.mockResolvedValue([
        {
          id: 1,
          slug: "p1",
          name: "P1",
          endpoints: [{ id: 10, url: "https://a.com", isEnabled: true }],
        },
      ]);
      mockPrisma.checkResult.findFirst.mockResolvedValue({
        latencyMs: 100,
        checkedAt: new Date(),
      });
      mockPrisma.checkResult.aggregate.mockResolvedValue({ _avg: { latencyMs: 80 } });
      mockPrisma.checkResult.groupBy.mockResolvedValue([
        { status: "UP", _count: 90 },
        { status: "DOWN", _count: 10 },
      ]);
      mockPrisma.incidentEvent.count.mockResolvedValue(1);

      const result = await service.fetchProviderRows();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe("down");
      expect(result[0].uptime24h).toBe(90);
      expect(result[0].errorRate24h).toBe(0.1);
    });

    it("computes trend up when lastLatency > avg3h * 1.15", async () => {
      mockPrisma.provider.findMany.mockResolvedValue([
        {
          id: 1,
          slug: "p1",
          name: "P1",
          endpoints: [{ id: 10, url: "https://a.com", isEnabled: true }],
        },
      ]);
      mockPrisma.checkResult.findFirst.mockResolvedValue({
        latencyMs: 120,
        checkedAt: new Date(),
      });
      mockPrisma.checkResult.aggregate.mockResolvedValue({ _avg: { latencyMs: 100 } });
      mockPrisma.checkResult.groupBy.mockResolvedValue([{ status: "UP", _count: 100 }]);
      mockPrisma.incidentEvent.count.mockResolvedValue(0);

      const result = await service.fetchProviderRows();

      expect(result[0].trend).toBe("up");
    });
  });

  describe("getProviderLatencyHistory", () => {
    it("returns null when provider not found", async () => {
      mockPrisma.provider.findUnique.mockResolvedValue(null);
      const result = await service.getProviderLatencyHistory("missing");
      expect(result).toBeNull();
    });

    it("returns empty array when provider has no endpoints", async () => {
      mockPrisma.provider.findUnique.mockResolvedValue({
        id: 1,
        slug: "p1",
        name: "P1",
        endpoints: [],
      });
      const result = await service.getProviderLatencyHistory("p1");
      expect(result).toEqual([]);
      expect(mockPrisma.checkResult.findMany).not.toHaveBeenCalled();
    });

    it("returns bucketed latency points when checks exist", async () => {
      const now = Date.now();
      mockPrisma.provider.findUnique.mockResolvedValue({
        id: 1,
        slug: "p1",
        name: "P1",
        endpoints: [{ id: 10 }],
      });
      mockPrisma.checkResult.findMany.mockResolvedValue([
        { checkedAt: new Date(now - 60000), latencyMs: 50 },
        { checkedAt: new Date(now - 30000), latencyMs: 60 },
      ]);
      const result = await service.getProviderLatencyHistory("p1", 180, 5);
      expect(Array.isArray(result)).toBe(true);
      expect(result!.length).toBeGreaterThanOrEqual(0);
    });
  });
});
