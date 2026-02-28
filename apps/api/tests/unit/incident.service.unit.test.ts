import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => {
  const mockFindMany = vi.fn();
  return {
    mockPrisma: {
      incidentEvent: { findMany: mockFindMany },
    },
  };
});

vi.mock("../../src/utils/prisma", () => ({ prisma: mockPrisma }));

import { IncidentService } from "../../src/services/incident.service";

describe("IncidentService", () => {
  let service: IncidentService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new IncidentService();
  });

  describe("getAll", () => {
    it("returns incidents ordered by startAt desc with provider included", async () => {
      const mockIncidents = [
        {
          id: 1,
          providerId: 1,
          startAt: new Date("2025-01-02"),
          endAt: null,
          type: "DOWN",
          message: "Outage",
          createdAt: new Date(),
          updatedAt: new Date(),
          provider: { id: 1, slug: "api1", name: "API One" },
        },
      ];
      mockPrisma.incidentEvent.findMany.mockResolvedValue(mockIncidents);

      const result = await service.getAll();

      expect(mockPrisma.incidentEvent.findMany).toHaveBeenCalledWith({
        orderBy: { startAt: "desc" },
        include: { provider: true },
      });
      expect(result).toEqual(mockIncidents);
    });

    it("returns empty array when no incidents", async () => {
      mockPrisma.incidentEvent.findMany.mockResolvedValue([]);
      const result = await service.getAll();
      expect(result).toEqual([]);
    });
  });

  describe("fetchByProviderId", () => {
    it("returns incidents for provider ordered by startAt desc", async () => {
      const mockIncidents = [
        {
          id: 1,
          providerId: 42,
          startAt: new Date("2025-01-02"),
          endAt: null,
          type: "DOWN",
          message: "Out",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockPrisma.incidentEvent.findMany.mockResolvedValue(mockIncidents);

      const result = await service.fetchByProviderId(42);

      expect(mockPrisma.incidentEvent.findMany).toHaveBeenCalledWith({
        where: { providerId: 42 },
        orderBy: { startAt: "desc" },
      });
      expect(result).toEqual(mockIncidents);
    });
  });
});
