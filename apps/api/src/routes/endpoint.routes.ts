import { Router, type IRouter } from "express";
import { EndpointService } from "../services/endpoint.service";

const router: IRouter = Router();
const service = new EndpointService();

router.get("/", async (_req, res) => {
  res.json(await service.getAll());
});

router.post("/", async (req, res) => {
  res.json(await service.create(req.body));
});

export default router;
