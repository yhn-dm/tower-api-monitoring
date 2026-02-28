/**
 * Lists incidents (all of them or filtered by provider id).
 */
import { prisma } from "../utils/prisma";

export class IncidentService {
  async getAll() {
    return prisma.incidentEvent.findMany({
      orderBy: { startAt: "desc" },
      include: { provider: true }
    });
  }

  async fetchByProviderId(providerId: number) {
    return prisma.incidentEvent.findMany({
      where: { providerId },
      orderBy: { startAt: "desc" }
    });
  }
}
