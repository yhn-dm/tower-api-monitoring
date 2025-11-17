import express, { Express } from "express";
import routes from "./routes";
import cors from "cors";
import dashboardRoutes from "./routes/dashboard.routes";


export function createServer(): Express {
  const app = express();


  app.use(
    cors({
      origin: "http://localhost:4200",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json());
  app.use("/", routes);
  
  

  return app;
}
