import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import config from "./config/index.js";

const app = express();

app.use(helmet());

app.use(cors({ origin: config.FRONTEND_URL, credentials: true }));

app.use(morgan("combined"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/v1/health", (_req, res) => {
  return res.status(200).json({ success: true, message: "Server is running" });
});

app.all("/*path", (_req, res) => {
  return res.status(404).json({ success: false, message: "Route not found" });
});

export default app;
