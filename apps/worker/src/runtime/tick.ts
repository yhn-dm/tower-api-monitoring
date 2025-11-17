import { prisma } from "../infra/db";
import { httpCheck } from "../lib/httpCheck";
import { detectIncident } from "../lib/incidentDetector";

export async function runTick() {
  console.log("⏱  Tick started…");

  let endpoints;
  try {
    endpoints = await prisma.endpoint.findMany({
      where: { isEnabled: true },
      include: { provider: true }
    });
  } catch (err) {
    console.error("Impossible de charger les endpoints :", err);
    return;
  }

for (const ep of endpoints) {

  console.log(`→ Checking ${ep.provider.name} | ${ep.url}`);

  try {
    const result = await httpCheck(ep.url, ep.method);

    console.log(
      `   status=${result.status} http=${result.httpStatus ?? "-"} latency=${result.latencyMs}ms error=${result.error ?? "-"}`
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
        region: ep.region ?? undefined
      }
    });

  } catch (err) {
    console.error(`Erreur lors du test de ${ep.url}`, err);
  }
}


  const uniqueProviders: number[] = Array.from(
  new Set(endpoints.map((ep: any) => ep.providerId))

);


  for (const providerId of uniqueProviders) {
    try {
      await detectIncident(providerId);
    } catch (err) {
      console.error(`Erreur detectIncident provider ${providerId}`, err);
    }
  }

  console.log("✔ Tick complete.");
}
