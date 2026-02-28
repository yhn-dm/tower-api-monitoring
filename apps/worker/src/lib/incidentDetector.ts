/**
 * Opens or closes incidents based on check results (down or high latency).
 */
import { prisma } from "@tower/db";
import { CheckStatus } from "@prisma/client";

const DEGRADED_LATENCY_MS = 2001;

function isDownStatus(status: CheckStatus) {
  return status === "DOWN" || status === "TIMEOUT" || status === "ERROR";
}

export async function evaluateProviderIncident(providerId: number) {
  const endpoints = await prisma.endpoint.findMany({
    where: { providerId },
    include: {
      checks: {
        orderBy: { checkedAt: "desc" },
        take: 1
      }
    }
  });

  if (endpoints.length === 0) return;

  const hasDown = endpoints.some((ep: any) => {
    const last = ep.checks[0];
    return last ? isDownStatus(last.status) : false;
  });

  const hasHighLatency = endpoints.some((ep: any) => {
    const last = ep.checks[0];
    if (!last || last.status !== "UP") return false;
    const lat = last.latencyMs ?? 0;
    return lat >= DEGRADED_LATENCY_MS;
  });

  const providerIsDown = hasDown;
  const providerIsDegraded = !hasDown && hasHighLatency;
  const hasProblem = providerIsDown || providerIsDegraded;

  const openIncident = await prisma.incidentEvent.findFirst({
    where: { providerId, endAt: null },
    orderBy: { startAt: "desc" }
  });

  if (hasProblem && !openIncident) {
    const type = providerIsDown ? "DOWN" : "SLOW";
    const message = providerIsDown
      ? "Service unavailable"
      : "High latency (degraded)";
    await prisma.incidentEvent.create({
      data: {
        providerId,
        startAt: new Date(),
        type,
        message
      }
    });
    console.log(`[incident] Opened ${type} for provider ${providerId}`);
    return;
  }

  if (!hasProblem && openIncident) {
    await prisma.incidentEvent.update({
      where: { id: openIncident.id },
      data: { endAt: new Date() }
    });
    console.log(`[incident] Closed for provider ${providerId}`);
  }
}
