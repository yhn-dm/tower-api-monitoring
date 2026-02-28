/**
 * Creates the Express app: CORS, JSON body, routes, 404, and central error handler.
 */
import express, { Express, Request, Response, NextFunction } from "express";
import routes from "./routes";
import cors from "cors";

function errorBody(code: string, message: string, details?: Record<string, string[]>) {
  return details ? { code, message, details } : { code, message };
}

export function createServer(): Express {
  const app = express();

  app.disable("x-powered-by");

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          return callback(null, true);
        }
        if (origin.startsWith("http://localhost")) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"), false);
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use("/", routes);

  app.use((_req: Request, res: Response) => {
    res.status(404).json(errorBody("NOT_FOUND", "Resource not found"));
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[api:error]", err.message);
    res.status(500).json(errorBody("SERVER_ERROR", "An unexpected error occurred"));
  });

  return app;
}
