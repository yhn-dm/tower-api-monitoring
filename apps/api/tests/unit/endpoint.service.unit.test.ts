import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    endpoint: { findMany: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("../../src/utils/prisma", () => ({ prisma: mockPrisma }));

import { EndpointService } from "../../src/services/endpoint.service";

describe("EndpointService", () => {
  let service: EndpointService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EndpointService();
  });

  describe("getAll", () => {
    it("returns all endpoints", async () => {
      const endpoints = [
        { id: 1, providerId: 1, url: "https://a.com", method: "GET" },
      ];
      mockPrisma.endpoint.findMany.mockResolvedValue(endpoints);
      const result = await service.getAll();
      expect(mockPrisma.endpoint.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(endpoints);
    });

    it("returns empty array when no endpoints", async () => {
      mockPrisma.endpoint.findMany.mockResolvedValue([]);
      const result = await service.getAll();
      expect(result).toEqual([]);
    });
  });

  describe("create", () => {
    it("creates endpoint with given data", async () => {
      const data = { providerId: 1, url: "https://api.example.com", method: "GET" };
      const created = { id: 1, ...data };
      mockPrisma.endpoint.create.mockResolvedValue(created);
      const result = await service.create(data);
      expect(mockPrisma.endpoint.create).toHaveBeenCalledWith({ data });
      expect(result).toEqual(created);
    });
  });
});
