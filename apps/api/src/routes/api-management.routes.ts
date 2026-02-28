/**
 * REST routes for providers and endpoints (CRUD, validation, async error handling).
 */
import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { ApiManagementService } from "../services/api-management.service";
import type {
  CreateProviderDto,
  UpdateProviderDto,
  CreateEndpointDto,
  UpdateEndpointDto,
} from "../types/api-management.types";

const router: IRouter = Router();
const service = new ApiManagementService();

function parseId(param: string): number | null {
  const n = parseInt(param, 10);
  return Number.isNaN(n) || n < 1 ? null : n;
}

function asyncHandler(
  fn: (req: Request, res: Response) => Promise<void>
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
}

// Boundary: providers
router.get(
  "/providers",
  asyncHandler(async (_req: Request, res: Response) => {
    const list = await service.getProviders();
    res.json(list);
  })
);

router.post(
  "/providers",
  asyncHandler(async (req: Request, res: Response) => {
    const dto = req.body as CreateProviderDto;
    const validationError = service.validateCreateProvider(dto);
    if (validationError) {
      res.status(400).json(validationError);
      return;
    }
    const result = await service.createProvider(dto);
    if (result.error) {
      if (result.error.code === "SLUG_ALREADY_EXISTS") {
        res.status(409).json(result.error);
        return;
      }
      res.status(404).json(result.error);
      return;
    }
    res.status(201).json(result.data);
  })
);

router.get(
  "/providers/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ code: "VALIDATION_ERROR", message: "Invalid provider id" });
      return;
    }
    const provider = await service.getProviderById(id);
    if (!provider) {
      res.status(404).json({ code: "PROVIDER_NOT_FOUND", message: "Provider not found" });
      return;
    }
    res.json(provider);
  })
);

router.put(
  "/providers/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ code: "VALIDATION_ERROR", message: "Invalid provider id" });
      return;
    }
    const dto = req.body as UpdateProviderDto;
    const result = await service.updateProvider(id, dto);
    if (result.error) {
      res.status(404).json(result.error);
      return;
    }
    res.json(result.data);
  })
);

router.delete(
  "/providers/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ code: "VALIDATION_ERROR", message: "Invalid provider id" });
      return;
    }
    const result = await service.deleteProvider(id);
    if (result.error) {
      res.status(404).json(result.error);
      return;
    }
    res.json(result.data);
  })
);

// Boundary: endpoints (create under provider)
router.post(
  "/providers/:id/endpoints",
  asyncHandler(async (req: Request, res: Response) => {
    const providerId = parseId(req.params.id);
    if (providerId === null) {
      res.status(400).json({ code: "VALIDATION_ERROR", message: "Invalid provider id" });
      return;
    }
    const dto = req.body as CreateEndpointDto;
    const validationError = service.validateCreateEndpoint(dto);
    if (validationError) {
      res.status(400).json(validationError);
      return;
    }
    const result = await service.createEndpoint(providerId, dto);
    if (result.error) {
      res.status(404).json(result.error);
      return;
    }
    res.status(201).json(result.data);
  })
);

// Boundary: endpoints (update/delete by id)
router.put(
  "/endpoints/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ code: "VALIDATION_ERROR", message: "Invalid endpoint id" });
      return;
    }
    const dto = req.body as UpdateEndpointDto;
    const validationError = service.validateUpdateEndpoint(dto);
    if (validationError) {
      res.status(400).json(validationError);
      return;
    }
    const result = await service.updateEndpoint(id, dto);
    if (result.error) {
      res.status(404).json(result.error);
      return;
    }
    res.json(result.data);
  })
);

router.delete(
  "/endpoints/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ code: "VALIDATION_ERROR", message: "Invalid endpoint id" });
      return;
    }
    const result = await service.deleteEndpoint(id);
    if (result.error) {
      res.status(404).json(result.error);
      return;
    }
    res.json(result.data);
  })
);

export default router;
