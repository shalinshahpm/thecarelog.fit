import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

console.log("Starting server...");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const server = registerRoutes(app);
const port = process.env.PORT || 5000;

setupVite(app).then(() => {
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
  });
});

const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
};

(async () => {
  try {
    console.log("Registering routes...");
    const server = registerRoutes(app);

    app.use(errorHandler);

    if (app.get("env") === "development") {
      console.log("Setting up Vite for development...");
      await setupVite(app, server);
    } else {
      console.log("Setting up static file serving for production...");
      serveStatic(app);
    }

    const PORT = 5000;
    server.listen(PORT, "0.0.0.0", () => {
      log(`Server started successfully, listening on port ${PORT}`);
    });

    server.on('error', (error: Error) => {
      console.error('Server error:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();