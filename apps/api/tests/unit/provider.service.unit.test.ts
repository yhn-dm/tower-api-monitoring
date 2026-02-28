import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    provider: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("../../src/utils/prisma", () => ({ prisma: mockPrisma }));

import { ProviderService } from "../../src/services/provider.service";

describe("ProviderService", () => {
  let service: ProviderService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ProviderService();
  });

  describe("getAll", () => {
    it("returns all providers", async () => {
      const providers = [{ id: 1, slug: "p1", name: "P1" }];
      mockPrisma.provider.findMany.mockResolvedValue(providers);
      const result = await service.getAll();
      expect(mockPrisma.provider.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(providers);
    });
  });

  describe("getStatus", () => {
    it("returns null when provider does not exist", async () => {
      mockPrisma.provider.findUnique.mockResolvedValue(null);
      const result = await service.getStatus("unknown");
      expect(result).toBeNull();
      expect(mockPrisma.provider.findUnique).toHaveBeenCalledWith({
        where: { slug: "unknown" },
        include: {
          endpoints: {
            include: {
              checks: { take: 1, orderBy: { checkedAt: "desc" } },
            },
          },
        },
      });
    });

    it("returns DOWN when at least one endpoint has DOWN check", async () => {
      mockPrisma.provider.findUnique.mockResolvedValue({
        slug: "my-api",
        endpoints: [
          { url: "https://a.com", checks: [{ status: "UP" }] },
          { url: "https://b.com", checks: [{ status: "DOWN" }] },
        ],
      });
      const result = await service.getStatus("my-api");
      expect(result).toEqual({
        provider: "my-api",
        status: "DOWN",
        endpoints: [
          { url: "https://a.com", last: { status: "UP" } },
          { url: "https://b.com", last: { status: "DOWN" } },
        ],
      });
    });

    it("returns UP when all endpoints are UP", async () => {
      mockPrisma.provider.findUnique.mockResolvedValue({
        slug: "my-api",
        endpoints: [
          { url: "https://a.com", checks: [{ status: "UP" }] },
        ],
      });
      const result = await service.getStatus("my-api");
      expect(result?.status).toBe("UP");
    });
  });

  describe("create", () => {
    it("creates provider with given data", async () => {
      const data = { slug: "new", name: "New API" };
      const created = { id: 1, ...data };
      mockPrisma.provider.create.mockResolvedValue(created);
      const result = await service.create(data);
      expect(mockPrisma.provider.create).toHaveBeenCalledWith({ data });
      expect(result).toEqual(created);
    });
  });
});
