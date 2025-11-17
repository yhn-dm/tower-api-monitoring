import { runTick } from "./tick";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const interval = 60_000;

export async function startWorker() {
  console.log("🚀 Worker started");

  while (true) {
    try {
      await runTick();
    } catch (e) {
      console.error("[Worker Crash Prevented]", e);
    }

    await sleep(interval);
  }
}