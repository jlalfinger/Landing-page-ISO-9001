import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import { initDb, addRegistrant, getRegistrants, getConfig, updateConfig } from "./src/lib/db";

// Initialize environment variables only if not in production/Vercel
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  config();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// --- API ROUTES ---

// Public: Ping (Minimal possible response)
const pingHandler = (req: express.Request, res: express.Response) => {
  res.status(200).json({ pong: true, time: new Date().toISOString(), url: req.url });
};
app.get("/api/ping", pingHandler);
app.get("/ping", pingHandler); 

// Public: Health Check
const healthHandler = async (req: express.Request, res: express.Response) => {
  try {
    const dbStatus = !!process.env.POSTGRES_URL;
    res.json({ 
      status: "ok", 
      env: process.env.NODE_ENV,
      db_configured: dbStatus,
      vercel: !!process.env.VERCEL,
      url: req.url
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: String(err) });
  }
};
app.get("/api/health", healthHandler);
app.get("/health", healthHandler);

// Public: Register
app.post("/api/register", async (req, res, next) => {
  try {
    if (!req.body.fullName || !req.body.email) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }
    await addRegistrant(req.body);
    res.json({ success: true });
  } catch (error: any) {
    next(error); 
  }
});

// Public: Get Config
app.get("/api/config", async (req, res) => {
  try {
    const configData = await getConfig();
    res.json(configData);
  } catch (err) {
    res.status(500).json({ error: "Failed to load config" });
  }
});

// Admin: Get Registrants
app.get("/api/admin/registrants", async (req, res) => {
  const registrants = await getRegistrants();
  res.json(registrants);
});

// Admin: Update Config
app.post("/api/admin/config", async (req, res) => {
  await updateConfig(req.body);
  res.json({ success: true });
});

// --- VITE MIDDLEWARE / STATIC SERVING ---

async function setupFrontend() {
  if (process.env.VERCEL === "1") return;

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith("/api/")) return next();
      
      try {
        const fs = await import("fs");
        const indexPath = path.resolve(process.cwd(), "index.html");
        
        let template = fs.readFileSync(indexPath, "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    const indexPath = path.resolve(distPath, "index.html");
    app.use(express.static(distPath, { index: false }));
    app.get("*", (req, res) => {
      res.sendFile(indexPath);
    });
  }
}

// Global Error Handler - LAST MIDDLEWARE
// MUST always return JSON for API requests
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Critical Server Error:", err);
  
  const status = err.status || err.statusCode || 500;
  const isApi = req.path.startsWith("/api/");

  if (isApi || !res.headersSent) {
    return res.status(status).json({
      error: "internal_server_error",
      message: err.message || "Un error inesperado ocurrió en el servidor",
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
    });
  }
  
  next(err);
});

// Server startup logic
if (process.env.VERCEL !== "1") {
  setupFrontend().then(() => {
    const PORT = Number(process.env.PORT || 3000);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening on port ${PORT}`);
    });
  }).catch(err => {
    console.error("Critical: Failed to start server:", err);
    // Emergency listen
    app.listen(Number(process.env.PORT || 3000), "0.0.0.0");
  });
}

export default app;
