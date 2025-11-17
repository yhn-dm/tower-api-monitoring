import { Router } from "express";

import dashboardRoutes from "./dashboard.routes";
import providerRoutes from "./provider.routes";
import endpointRoutes from "./endpoint.routes";
import checkRoutes from "./check.routes";
import incidentRoutes from "./incident.routes";

const router = Router();

router.use("/dashboard", dashboardRoutes);
router.use("/providers", providerRoutes);
router.use("/endpoints", endpointRoutes);
router.use("/checks", checkRoutes);
router.use("/incidents", incidentRoutes);

export default router;