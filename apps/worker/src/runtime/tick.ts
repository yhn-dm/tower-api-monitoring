/**
 * One tick: load enabled endpoints, run HTTP checks, save results, then evaluate incidents per provider.
 */
import { prisma } from "../infra/db";
import { performHttpCheck } from "../lib/httpCheck";
import { evaluateProviderIncident } from "../lib/incidentDetector";

export async function runMonitoringTickOnce() {
  console.log("[tick] Started");

  let endpoints;
  try {
    endpoints = await prisma.endpoint.findMany({
      where: { isEnabled: true },
      include: { provider: true }
    });
  } catch (err) {
    console.error("Failed to load endpoints list for this tick run:", err);
    return;
  }

  for (const ep of endpoints) {
    console.log(`[tick] Checking ${ep.provider.name} | ${ep.url}`);
    console.log(`   Method=${ep.method}`);

    try {
      const result = await performHttpCheck(ep.url, ep.method);

      console.log(
        `   status=${result.status} http=${result.httpStatus ?? "-"} latency=${result.latencyMs}ms error=${result.error ?? "-"
        }`,
      );

      await prisma.checkResult.create({
        data: {
          endpointId: ep.id,
          status: result.status,
          httpStatus: result.httpStatus,
          latencyMs: result.latencyMs,
          responseSizeBytes: result.responseSizeBytes,
          error: result.error,
          checkedAt: new Date(),
          region: ep.region ?? undefined,
        },
      });
    } catch (err) {
      console.error(`Error while testing endpoint ${ep.url}`, err);
    }
  }


  const uniqueProviders: number[] = Array.from(
    new Set(endpoints.map((ep: any) => ep.providerId)),
  );

  for (const providerId of uniqueProviders) {
    try {
      await evaluateProviderIncident(providerId);
    } catch (err) {
      console.error(
        `Error while running evaluateProviderIncident for provider ${providerId}`,
        err,
      );
    }
  }

  console.log("[tick] Complete.");
}
