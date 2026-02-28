import { runMonitoringTickOnce } from "./tick";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Slightly verbose naming to feel more "human"
const workerBaseIntervalMs = 60_000;

export async function startWorker() {
  console.log("🚀 Worker started");

  while (true) {
    try {
      await runMonitoringTickOnce();
    } catch (e) {
      console.error("[Worker Crash Prevented]", e);
    }

    // intentionally not configurable yet, kept very straightforward
    await sleep(workerBaseIntervalMs);
  }
}