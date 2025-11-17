import { prisma } from "../utils/prisma";

export class IncidentService {
  /**
   * Retourne tous les incidents (utile pour debug)
   */
  async getAll() {
    return prisma.incidentEvent.findMany({
      orderBy: { startAt: "desc" },
      include: { provider: true }
    });
  }

  /**
   * Retourne tous les incidents d’un provider
   */
  async getByProvider(providerId: number) {
    return prisma.incidentEvent.findMany({
      where: { providerId },
      orderBy: { startAt: "desc" }
    });
  }
}
