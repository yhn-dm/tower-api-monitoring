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

  const rows = await dashboardService.getProviderRows();
  const provider = rows.find(p => p.slug === slug);

  if (!provider) {
    return res.status(404).json({ error: "Provider not found" });
  }

  res.json(provider);
});


router.get("/:slug/status", async (req, res) => {
  res.json(await providerService.getStatus(req.params.slug));
});


router.post("/", async (req, res) => {
  res.json(await providerService.create(req.body));
});

export default router;
