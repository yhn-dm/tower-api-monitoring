import { Router, type IRouter } from "express";
import { IncidentService } from "../services/incident.service";

const router: IRouter = Router();

const service = new IncidentService();

router.get("/", async (_req, res) => {
  res.json(await service.getAll());
});

router.get("/:providerId", async (req, res) => {
  res.json(await service.getByProvider(Number(req.params.providerId)));
});

export default router;
