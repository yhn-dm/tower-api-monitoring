/**
 * Serves the provider rows for the dashboard.
 */
import { Router, type IRouter } from "express";
import { DashboardService } from "../services/dashboard.service";

const router: IRouter = Router();
const service = new DashboardService();

router.get("/", async (_req, res) => {
  const data = await service.fetchProviderRows();
  res.json(data);
});



export default router;
