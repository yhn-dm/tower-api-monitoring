/**
 * Builds dashboard rows per provider (status, uptime, latency, incidents) and latency history buckets.
 */
import { prisma } from "../utils/prisma";
import { ProviderDashboardRow } from "../types/dashboard.types";

export class DashboardService {

  async fetchProviderRows(): Promise<ProviderDashboardRow[]> {

    const providers = await prisma.provider.findMany({
      include: { endpoints: true }
    });

    const rows: ProviderDashboardRow[] = [];

    for (const provider of providers) {
      const endpointIds = provider.endpoints.map(ep => ep.id);
      if (endpointIds.length === 0) continue;

      const lastCheck = await prisma.checkResult.findFirst({
        where: { endpointId: { in: endpointIds }},
        orderBy: { checkedAt: "desc" }
      });

      const lastLatency = lastCheck?.latencyMs ?? null;

      const avg3h = await prisma.checkResult.aggregate({
        _avg: { latencyMs: true },
        where: {
          endpointId: { in: endpointIds },
          checkedAt: { gte: new Date(Date.now() - 3 * 60 * 60 * 1000) }
        }
      });

      const avgLatency3h = avg3h._avg.latencyMs ?? null;

      const last24h = await prisma.checkResult.groupBy({
        by: ["status"],
        where: {
          endpointId: { in: endpointIds },
          checkedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        },
        _count: true
      });

      const total24h = last24h.reduce(
        (a: number, r: { status: string; _count: number }) => a + r._count,
        0
      );

      const errors24h = last24h
        .filter((r: { status: string; _count: number }) => r.status !== "UP")
        .reduce(
          (a: number, r: { status: string; _count: number }) => a + r._count,
          0
        );

      const errorRate24h =
        total24h === 0 ? 0 : errors24h / total24h;

      const uptime24h =
        total24h === 0
          ? 100
          : ((total24h - errors24h) / total24h) * 100;

      const incidents24h = await prisma.incidentEvent.count({
        where: {
          providerId: provider.id,
          startAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      });

      const avgSize = await prisma.checkResult.aggregate({
        _avg: { responseSizeBytes: true },
        where: {
          endpointId: { in: endpointIds },
          checkedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      });

      const avgResponseSize = avgSize._avg.responseSizeBytes ?? null;

      let status: "operational" | "degraded" | "down" = "operational";
      if (uptime24h < 95 || errorRate24h > 0.1) status = "down";
      else if (uptime24h <= 99) status = "degraded";

      let trend: "up" | "down" | "stable" = "stable";

    if (lastLatency && avgLatency3h) {
    if (lastLatency > avgLatency3h * 1.15) {
        trend = "up";
    } else if (lastLatency < avgLatency3h * 0.85) {
        trend = "down";
    }
    }


      const primaryEndpoint = provider.endpoints.find((ep: { isEnabled: boolean }) => ep.isEnabled) ?? provider.endpoints[0];
      const primaryEndpointUrl = primaryEndpoint?.url ?? null;

      rows.push({
        providerId: provider.id,
        name: provider.name,
        slug: provider.slug,
        status,
        trend,
        lastLatency,
        avgLatency3h,
        errorRate24h,
        uptime24h,
        incidents24h,
        avgResponseSize,
        lastCheckAt: lastCheck?.checkedAt ?? null,
        primaryEndpointUrl
      });
    }

    return rows;
  }

  async getProviderLatencyHistory(
    slug: string,
    windowMinutes: number = 180,
    stepMinutes: number = 5
  ): Promise<{ timestamp: Date; latencyMs: number }[] | null> {
    const provider = await prisma.provider.findUnique({
      where: { slug },
      include: { endpoints: true },
    });

    if (!provider) {
      return null;
    }

    const endpointIds = provider.endpoints.map((e) => e.id);
    if (endpointIds.length === 0) {
      return Array.from([]);
    }

    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    const since = new Date(now - windowMs);

    const checks = await prisma.checkResult.findMany({
      where: {
        endpointId: { in: endpointIds },
        checkedAt: { gte: since },
      },
      orderBy: { checkedAt: "asc" },
      select: {
        checkedAt: true,
        latencyMs: true,
      },
    });

    if (checks.length === 0) {
      return [];
    }

    const bucketMs = Math.max(1, stepMinutes) * 60 * 1000;
    const buckets = new Map<
      number,
      {
        sum: number;
        count: number;
      }
    >();

    for (const check of checks) {
      if (check.latencyMs == null) continue;
      const t = check.checkedAt.getTime();
      const bucketStart = Math.floor(t / bucketMs) * bucketMs;

      const bucket = buckets.get(bucketStart) ?? { sum: 0, count: 0 };
      bucket.sum += check.latencyMs;
      bucket.count += 1;
      buckets.set(bucketStart, bucket);
    }

    const points = Array.from(buckets.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([ts, { sum, count }]) => ({
        timestamp: new Date(ts),
        latencyMs: count === 0 ? 0 : Math.round(sum / count),
      }));

    return points;
  }
}
