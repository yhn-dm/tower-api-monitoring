import { prisma } from "@tower/db";
import { ProviderDashboardRow } from "../types/dashboard.types";

export class DashboardService {

  async getProviderRows(): Promise<ProviderDashboardRow[]> {

    const providers = await prisma.provider.findMany({
      include: { endpoints: true }
    });

    const rows: ProviderDashboardRow[] = [];

    for (const p of providers) {
      const endpointIds = p.endpoints.map(e => e.id);
      if (endpointIds.length === 0) continue;

      // ---------- 1. LAST CHECK ----------
      const lastCheck = await prisma.checkResult.findFirst({
        where: { endpointId: { in: endpointIds }},
        orderBy: { checkedAt: "desc" }
      });

      const lastLatency = lastCheck?.latencyMs ?? null;

      // ---------- 2. AVG LATENCY (3h) ----------
      const avg3h = await prisma.checkResult.aggregate({
        _avg: { latencyMs: true },
        where: {
          endpointId: { in: endpointIds },
          checkedAt: { gte: new Date(Date.now() - 3 * 60 * 60 * 1000) }
        }
      });

      const avgLatency3h = avg3h._avg.latencyMs ?? null;

      // ---------- 3. ERROR RATE (24h) ----------
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

      // ---------- 4. UPTIME ----------
      const uptime24h =
        total24h === 0
          ? 100
          : ((total24h - errors24h) / total24h) * 100;

      const incidents24h = errors24h;

      // ---------- 5. AVG RESPONSE SIZE ----------
      const avgSize = await prisma.checkResult.aggregate({
        _avg: { responseSizeBytes: true },
        where: {
          endpointId: { in: endpointIds },
          checkedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      });

      const avgResponseSize = avgSize._avg.responseSizeBytes ?? null;

      // ---------- 6. STATUS ----------
      let status: "operational" | "degraded" | "down" = "operational";

if (uptime24h < 95 || errorRate24h > 0.1) status = "down";
else if (uptime24h < 99) status = "degraded";

      // ---------- 7. TREND ----------
    let trend: "up" | "down" | "stable" = "stable";

    if (lastLatency && avgLatency3h) {
    if (lastLatency > avgLatency3h * 1.15) {
        trend = "up";
    } else if (lastLatency < avgLatency3h * 0.85) {
        trend = "down";
    }
    }


      rows.push({
        providerId: p.id,
        name: p.name,
        slug: p.slug,
        status,
        trend,
        lastLatency,
        avgLatency3h,
        errorRate24h,
        uptime24h,
        incidents24h,
        avgResponseSize,
        lastCheckAt: lastCheck?.checkedAt ?? null
      });
    }

    return rows;
  }
}
