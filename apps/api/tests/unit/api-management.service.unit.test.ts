import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    provider: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    endpoint: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("../../src/utils/prisma", () => ({ prisma: mockPrisma }));

import { ApiManagementService } from "../../src/services/api-management.service";

describe("ApiManagementService", () => {
  let service: ApiManagementService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ApiManagementService();
  });

  describe("validateCreateProvider", () => {
    it("returns error when slug is missing", () => {
      const err = service.validateCreateProvider({ slug: "", name: "A" });
      expect(err).not.toBeNull();
      expect(err?.code).toBe("VALIDATION_ERROR");
      expect(err?.details?.slug).toBeDefined();
    });

    it("returns error when slug has invalid format", () => {
      const err = service.validateCreateProvider({ slug: "Invalid_Slug", name: "A" });
      expect(err).not.toBeNull();
      expect(err?.details?.slug).toBeDefined();
    });

    it("returns null for valid dto", () => {
      const err = service.validateCreateProvider({ slug: "my-api", name: "My API" });
      expect(err).toBeNull();
    });
  });

  describe("validateCreateEndpoint", () => {
    it("returns error when url is missing", () => {
      const err = service.validateCreateEndpoint({});
      expect(err).not.toBeNull();
      expect(err?.details?.url).toBeDefined();
    });

    it("returns error when url is invalid", () => {
      const err = service.validateCreateEndpoint({ url: "not-a-url" });
      expect(err).not.toBeNull();
    });

    it("returns null for valid url", () => {
      const err = service.validateCreateEndpoint({ url: "https://api.example.com" });
      expect(err).toBeNull();
    });
  });

  describe("createProvider", () => {
    it("returns error when slug already exists", async () => {
      mockPrisma.provider.findUnique.mockResolvedValue({ id: 1, slug: "existing" });
      const result = await service.createProvider({
        slug: "existing",
        name: "Existing",
      });
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe("SLUG_ALREADY_EXISTS");
      expect(mockPrisma.provider.create).not.toHaveBeenCalled();
    });

    it("creates provider and returns data when slug is free", async () => {
      mockPrisma.provider.findUnique.mockResolvedValue(null);
      const created = {
        id: 1,
        slug: "new-api",
        name: "New API",
        logoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.provider.create.mockResolvedValue(created);

      const result = await service.createProvider({
        slug: "new-api",
        name: "New API",
      });

      expect(result.data).toEqual(created);
      expect(result.error).toBeUndefined();
      expect(mockPrisma.provider.create).toHaveBeenCalledWith({
        data: {
          slug: "new-api",
          name: "New API",
          logoUrl: null,
        },
      });
    });
  });

  describe("updateEndpoint", () => {
    it("returns error when endpoint not found", async () => {
      mockPrisma.endpoint.findUnique.mockResolvedValue(null);
      const result = await service.updateEndpoint(999, { url: "https://x.com" });
      expect(result.error?.code).toBe("ENDPOINT_NOT_FOUND");
      expect(mockPrisma.endpoint.update).not.toHaveBeenCalled();
    });

    it("updates endpoint and returns data", async () => {
      mockPrisma.endpoint.findUnique.mockResolvedValue({
        id: 1,
        providerId: 1,
        url: "https://old.com",
        method: "GET",
      });
      const updated = {
        id: 1,
        providerId: 1,
        url: "https://new.com",
        method: "GET",
        region: "global",
        isEnabled: true,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.endpoint.update.mockResolvedValue(updated);

      const result = await service.updateEndpoint(1, { url: "https://new.com" });

      expect(result.data).toEqual(updated);
      expect(result.error).toBeUndefined();
    });
  });

  describe("deleteProvider", () => {
    it("returns error when provider not found", async () => {
      mockPrisma.provider.findUnique.mockResolvedValue(null);
      const result = await service.deleteProvider(999);
      expect(result.error?.code).toBe("PROVIDER_NOT_FOUND");
      expect(mockPrisma.provider.delete).not.toHaveBeenCalled();
    });

    it("deletes provider (cascade handled by Prisma)", async () => {
      mockPrisma.provider.findUnique.mockResolvedValue({
        id: 1,
        slug: "to-delete",
      });
      mockPrisma.provider.delete.mockResolvedValue(undefined);

      const result = await service.deleteProvider(1);

      expect(result.data).toEqual({ deleted: true });
      expect(mockPrisma.provider.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
