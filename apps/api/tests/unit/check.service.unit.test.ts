import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    checkResult: { findMany: vi.fn() },
  },
}));

vi.mock("../../src/utils/prisma", () => ({ prisma: mockPrisma }));

import { CheckService } from "../../src/services/check.service";

describe("CheckService", () => {
  let service: CheckService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CheckService();
  });

  describe("getTimeline", () => {
    it("returns check results for provider slug ordered by checkedAt desc", async () => {
      const checks = [
        {
          id: 1n,
          endpointId: 1,
          status: "UP",
          httpStatus: 200,
          latencyMs: 50,
          checkedAt: new Date(),
        },
      ];
      mockPrisma.checkResult.findMany.mockResolvedValue(checks);

      const result = await service.getTimeline("my-api", 10);

      expect(mockPrisma.checkResult.findMany).toHaveBeenCalledWith({
        where: { endpoint: { provider: { slug: "my-api" } } },
        take: 10,
        orderBy: { checkedAt: "desc" },
      });
      expect(result).toEqual(checks);
    });

    it("returns empty array when no checks", async () => {
      mockPrisma.checkResult.findMany.mockResolvedValue([]);
      const result = await service.getTimeline("empty", 5);
      expect(result).toEqual([]);
    });
  });
});
