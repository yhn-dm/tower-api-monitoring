import { Router, type IRouter } from "express";
import { CheckService } from "../services/check.service";

const router: IRouter = Router();
const service = new CheckService();

router.get("/:slug/timeline", async (req, res) => {
  const limit = Number(req.query.limit) || 200;
  res.json(await service.getTimeline(req.params.slug, limit));
});

export default router;
