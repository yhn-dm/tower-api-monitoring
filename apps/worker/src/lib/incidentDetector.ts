import { prisma } from "@tower/db";
import { Prisma } from "@prisma/client";

import { CheckStatus } from "@prisma/client";

// Détermine si un status représente une indispo
function isDownStatus(status: CheckStatus) {
  return status === "DOWN" || status === "TIMEOUT" || status === "ERROR";
}

export async function detectIncident(providerId: number) {
  // Récupère tous les endpoints du provider
  const endpoints = await prisma.endpoint.findMany({
    where: { providerId },
    include: {
      checks: {
        orderBy: { checkedAt: "desc" },
        take: 1
      }
    }
  });

  // Si aucun endpoint → ignorer
  if (endpoints.length === 0) return;

  // Est-ce qu'au moins un endpoint est DOWN ?
  const providerIsDown = endpoints.some((ep: any )=> {
    const last = ep.checks[0];
    return last ? isDownStatus(last.status) : false;
  });

  // Incident en cours ?
  const openIncident = await prisma.incidentEvent.findFirst({
    where: { providerId, endAt: null },
    orderBy: { startAt: "desc" }
  });

  // ------ OUVERTURE INCIDENT ------
  if (providerIsDown && !openIncident) {
    await prisma.incidentEvent.create({
      data: {
        providerId,
        startAt: new Date(),
        type: "DOWN",
        message: "Service unavailable"
      }
    });
    console.log(`⚠ Incident ouvert pour provider ${providerId}`);
    return;
  }

  // ------ FERMETURE INCIDENT ------
  if (!providerIsDown && openIncident) {
    await prisma.incidentEvent.update({
      where: { id: openIncident.id },
      data: { endAt: new Date() }
    });
    console.log(`✔ Incident fermé pour provider ${providerId}`);
  }
}
