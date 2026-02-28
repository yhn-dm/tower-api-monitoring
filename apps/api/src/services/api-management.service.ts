/**
 * CRUD for providers and endpoints, plus validation, slug uniqueness, and audit log.
 */
import { prisma } from "../utils/prisma";
import type {
  CreateProviderDto,
  UpdateProviderDto,
  CreateEndpointDto,
  UpdateEndpointDto,
  ApiManagementErrorBody,
  HttpMethod,
} from "../types/api-management.types";
import { HTTP_METHODS } from "../types/api-management.types";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_MIN = 1;
const SLUG_MAX = 64;
const NAME_MAX = 128;
const URL_MAX = 512;
const REGION_MAX = 32;
const DESCRIPTION_MAX = 255;
const LOGO_URL_MAX = 255;

function auditLog(action: string, resource: string, id?: number | string, details?: object) {
  const payload = {
    at: new Date().toISOString(),
    action,
    resource,
    ...(id != null && { id }),
    ...(details && { details }),
  };
  console.info("[api-management:audit]", JSON.stringify(payload));
}

function validUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export class ApiManagementService {
  validateCreateProvider(dto: CreateProviderDto): ApiManagementErrorBody | null {
    const details: Record<string, string[]> = {};
    if (!dto.slug || typeof dto.slug !== "string") {
      details.slug = ["slug is required"];
    } else {
      if (dto.slug.length < SLUG_MIN || dto.slug.length > SLUG_MAX) {
        details.slug = [`slug must be between ${SLUG_MIN} and ${SLUG_MAX} characters`];
      } else if (!SLUG_PATTERN.test(dto.slug)) {
        details.slug = ["slug must be lowercase alphanumeric with hyphens only"];
      }
    }
    if (!dto.name || typeof dto.name !== "string") {
      details.name = ["name is required"];
    } else if (dto.name.length > NAME_MAX) {
      details.name = [`name must be at most ${NAME_MAX} characters`];
    }
    if (dto.logoUrl != null && dto.logoUrl !== "") {
      if (typeof dto.logoUrl !== "string" || dto.logoUrl.length > LOGO_URL_MAX) {
        details.logoUrl = [`logoUrl must be at most ${LOGO_URL_MAX} characters`];
      }
    }
    if (Object.keys(details).length === 0) return null;
    return { code: "VALIDATION_ERROR", message: "Validation failed", details };
  }

  validateCreateEndpoint(dto: CreateEndpointDto): ApiManagementErrorBody | null {
    const details: Record<string, string[]> = {};
    if (!dto.url || typeof dto.url !== "string") {
      details.url = ["url is required"];
    } else {
      if (dto.url.length > URL_MAX) details.url = [`url must be at most ${URL_MAX} characters`];
      else if (!validUrl(dto.url)) details.url = ["url must be a valid http(s) URL"];
    }
    if (dto.method != null && dto.method !== "") {
      const m = (dto.method || "GET").toUpperCase();
      if (!(HTTP_METHODS as readonly string[]).includes(m)) {
        details.method = [`method must be one of: ${HTTP_METHODS.join(", ")}`];
      }
    }
    if (dto.region != null && typeof dto.region === "string" && dto.region.length > REGION_MAX) {
      details.region = [`region must be at most ${REGION_MAX} characters`];
    }
    if (
      dto.description != null &&
      typeof dto.description === "string" &&
      dto.description.length > DESCRIPTION_MAX
    ) {
      details.description = [`description must be at most ${DESCRIPTION_MAX} characters`];
    }
    if (Object.keys(details).length === 0) return null;
    return { code: "VALIDATION_ERROR", message: "Validation failed", details };
  }

  validateUpdateEndpoint(dto: UpdateEndpointDto): ApiManagementErrorBody | null {
    const details: Record<string, string[]> = {};
    if (dto.url != null) {
      if (typeof dto.url !== "string" || dto.url.length === 0) {
        details.url = ["url must be a non-empty string"];
      } else if (dto.url.length > URL_MAX) {
        details.url = [`url must be at most ${URL_MAX} characters`];
      } else if (!validUrl(dto.url)) {
        details.url = ["url must be a valid http(s) URL"];
      }
    }
    if (dto.method != null && dto.method !== "") {
      const m = dto.method.toUpperCase();
      if (!(HTTP_METHODS as readonly string[]).includes(m)) {
        details.method = [`method must be one of: ${HTTP_METHODS.join(", ")}`];
      }
    }
    if (dto.region != null && typeof dto.region === "string" && dto.region.length > REGION_MAX) {
      details.region = [`region must be at most ${REGION_MAX} characters`];
    }
    if (
      dto.description != null &&
      typeof dto.description === "string" &&
      dto.description.length > DESCRIPTION_MAX
    ) {
      details.description = [`description must be at most ${DESCRIPTION_MAX} characters`];
    }
    if (Object.keys(details).length === 0) return null;
    return { code: "VALIDATION_ERROR", message: "Validation failed", details };
  }

  async getProviders() {
    return prisma.provider.findMany({
      include: { endpoints: true },
      orderBy: { name: "asc" },
    });
  }

  async getProviderById(id: number) {
    return prisma.provider.findUnique({
      where: { id },
      include: { endpoints: true },
    });
  }

  async createProvider(dto: CreateProviderDto) {
    const existing = await prisma.provider.findUnique({ where: { slug: dto.slug } });
    if (existing) {
      return {
        error: { code: "SLUG_ALREADY_EXISTS", message: "A provider with this slug already exists" },
      };
    }
    const provider = await prisma.provider.create({
      data: {
        slug: dto.slug.trim().toLowerCase(),
        name: dto.name.trim(),
        logoUrl: dto.logoUrl?.trim() || null,
      },
    });
    auditLog("create", "provider", provider.id, { slug: provider.slug });
    return { data: provider };
  }

  async updateProvider(id: number, dto: UpdateProviderDto) {
    const provider = await prisma.provider.findUnique({ where: { id } });
    if (!provider) {
      return { error: { code: "PROVIDER_NOT_FOUND", message: "Provider not found" } };
    }
    const updated = await prisma.provider.update({
      where: { id },
      data: {
        ...(dto.name != null && { name: dto.name.trim() }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl?.trim() || null }),
      },
    });
    auditLog("update", "provider", id, { slug: updated.slug });
    return { data: updated };
  }

  async deleteProvider(id: number) {
    const provider = await prisma.provider.findUnique({ where: { id } });
    if (!provider) {
      return { error: { code: "PROVIDER_NOT_FOUND", message: "Provider not found" } };
    }
    await prisma.provider.delete({ where: { id } });
    auditLog("delete", "provider", id, { slug: provider.slug });
    return { data: { deleted: true } };
  }

  async createEndpoint(providerId: number, dto: CreateEndpointDto) {
    const provider = await prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) {
      return { error: { code: "PROVIDER_NOT_FOUND", message: "Provider not found" } };
    }
    const method = (dto.method?.toUpperCase() || "GET") as HttpMethod;
    const endpoint = await prisma.endpoint.create({
      data: {
        providerId,
        url: dto.url.trim(),
        method: (HTTP_METHODS as readonly string[]).includes(method) ? method : "GET",
        region: dto.region?.trim() || "global",
        description: dto.description?.trim() || null,
        isEnabled: dto.isEnabled ?? true,
      },
    });
    auditLog("create", "endpoint", endpoint.id, { providerId, url: endpoint.url });
    return { data: endpoint };
  }

  async getEndpointById(id: number) {
    return prisma.endpoint.findUnique({
      where: { id },
      include: { provider: true },
    });
  }

  async updateEndpoint(id: number, dto: UpdateEndpointDto) {
    const endpoint = await prisma.endpoint.findUnique({ where: { id } });
    if (!endpoint) {
      return { error: { code: "ENDPOINT_NOT_FOUND", message: "Endpoint not found" } };
    }
    const method = dto.method != null ? (dto.method.toUpperCase() as HttpMethod) : undefined;
    const updated = await prisma.endpoint.update({
      where: { id },
      data: {
        ...(dto.url != null && { url: dto.url.trim() }),
        ...(method != null && { method: (HTTP_METHODS as readonly string[]).includes(method) ? method : endpoint.method }),
        ...(dto.region !== undefined && { region: dto.region?.trim() ?? "global" }),
        ...(dto.description !== undefined && { description: dto.description?.trim() || null }),
        ...(dto.isEnabled !== undefined && { isEnabled: Boolean(dto.isEnabled) }),
      },
    });
    auditLog("update", "endpoint", id, { providerId: endpoint.providerId });
    return { data: updated };
  }

  async deleteEndpoint(id: number) {
    const endpoint = await prisma.endpoint.findUnique({ where: { id } });
    if (!endpoint) {
      return { error: { code: "ENDPOINT_NOT_FOUND", message: "Endpoint not found" } };
    }
    await prisma.endpoint.delete({ where: { id } });
    auditLog("delete", "endpoint", id, { providerId: endpoint.providerId });
    return { data: { deleted: true } };
  }
}
