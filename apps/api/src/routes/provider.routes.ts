/**
 * Provider by slug, latency history, status; legacy create endpoint.
 */
import { Router, type IRouter } from "express";
import { ProviderService } from "../services/provider.service";
import { DashboardService } from "../services/dashboard.service";

const router: IRouter = Router();

const providerService = new ProviderService();
const dashboardService = new DashboardService();


router.get("/", async (_req, res) => {
  res.json(await providerService.getAll());
});


router.get("/:slug", async (req, res) => {
  const slug = req.params.slug;

  const rows = await dashboardService.fetchProviderRows();
  const provider = rows.find(p => p.slug === slug);

  if (!provider) {
    return res.status(404).json({ error: "Provider not found" });
  }

  res.json(provider);
});


router.get("/:slug/latency-history", async (req, res) => {
  const slug = req.params.slug;

  const windowMinutes = req.query.windowMinutes
    ? Number.parseInt(String(req.query.windowMinutes), 10)
    : 180;

  const stepMinutes = req.query.stepMinutes
    ? Number.parseInt(String(req.query.stepMinutes), 10)
    : 5;

  const history = await dashboardService.getProviderLatencyHistory(
    slug,
    Number.isNaN(windowMinutes) ? 180 : windowMinutes,
    Number.isNaN(stepMinutes) ? 5 : stepMinutes
  );

  if (history === null) {
    return res.status(404).json({ error: "Provider not found" });
  }

  return res.json(
    history.map((p) => ({
      timestamp: p.timestamp.toISOString(),
      latencyMs: p.latencyMs,
    }))
  );
});


router.get("/:slug/status", async (req, res) => {
  res.json(await providerService.getStatus(req.params.slug));
});


router.post("/", async (req, res) => {
  res.json(await providerService.create(req.body));
});

export default router;
