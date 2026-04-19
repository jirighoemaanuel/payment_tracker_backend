import express from "express";
import cors from "cors";
import morgan from "morgan";

import tenantRoutes from "./routes/tenantRoutes.js";
import unitRoutes from "./routes/unitRoutes.js";
import agreementRoutes from "./routes/agreementRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    data: null,
  });
});

app.use("/api/v1/tenants", tenantRoutes);
app.use("/api/v1/units", unitRoutes);
app.use("/api/v1/agreements", agreementRoutes);
app.use("/api/v1/payments", paymentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
