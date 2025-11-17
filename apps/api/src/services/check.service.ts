import { prisma } from "../utils/prisma";

export class CheckService {
  async getTimeline(slug: string, limit: number) {
    return prisma.checkResult.findMany({
      where: {
        endpoint: { provider: { slug } }
      },
      take: limit,
      orderBy: { checkedAt: "desc" }
    });
  }
}
