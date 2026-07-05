import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import { apiRoutes } from "./routes";

export const createApp = () => {
const app = express();

app.set("trust proxy", 1);

app.use(helmet());

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://spectatorial-sporadically-jaquelyn.ngrok-free.dev"
    ];

    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.options("*", cors());
app.use((req, res, next) => {
  if (req.originalUrl === "/payments/webhook") {
    return next();
  }

  express.json({ limit: "1mb" })(req, res, next);
});
 app.use(apiRoutes);

app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.get("/health", (_req, res) => res.json({ ok: true }));


app.use(errorHandler);

  return app;
};
