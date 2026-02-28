/**
 * Mounts all route modules under their prefixes.
 */
import { Router } from "express";

import dashboardRoutes from "./dashboard.routes";
import providerRoutes from "./provider.routes";
import endpointRoutes from "./endpoint.routes";
import checkRoutes from "./check.routes";
import incidentRoutes from "./incident.routes";
import apiManagementRoutes from "./api-management.routes";

const router = Router();

router.use("/dashboard", dashboardRoutes);
router.use("/providers", providerRoutes);
router.use("/endpoints", endpointRoutes);
router.use("/checks", checkRoutes);
router.use("/incidents", incidentRoutes);
router.use("/api-management", apiManagementRoutes);

export default router;