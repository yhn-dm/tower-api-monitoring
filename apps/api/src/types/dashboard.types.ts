export interface ProviderDashboardRow {
  providerId: number;
  slug: string;
  name: string;

  status: "operational" | "degraded" | "down";

  trend: "up" | "down" | "stable";

  lastLatency: number | null;
  avgLatency3h: number | null;

  errorRate24h: number;
  uptime24h: number;
  incidents24h: number;

  avgResponseSize: number | null;
  lastCheckAt: Date | null;
}
