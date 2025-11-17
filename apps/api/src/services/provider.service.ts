import { prisma } from "../utils/prisma";

export class ProviderService {
  async getAll() {
    return prisma.provider.findMany();
  }

  async create(data: any) {
    return prisma.provider.create({ data });
  }

  async getStatus(slug: string) {
    const provider = await prisma.provider.findUnique({
      where: { slug },
      include: {
        endpoints: {
          include: {
            checks: {
              take: 1,
              orderBy: { checkedAt: "desc" }
            }
          }
        }
      }
    });

    if (!provider) return null;

    const statuses = provider.endpoints.map(ep => ep.checks[0]?.status);
    const isDown = statuses.includes("DOWN");

    const status = isDown ? "DOWN" : "UP";

    return {
      provider: provider.slug,
      status,
      endpoints: provider.endpoints.map(ep => ({
        url: ep.url,
        last: ep.checks[0] || null
      }))
    };
  }
}
