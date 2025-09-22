import express from "express";
import { serverConfig } from "./config";
import connectDB from "./config/db.config";
import logger from "./config/logger.config";
import v1Routes from "./routes/v1/index.routes";
import { appErrorHandler } from "./middlewares/error.middleware";
import { attachCorrelationIdMiddleware } from "./middlewares/correlation.middleware";

const app = express();

app.use(express.json());

app.use(attachCorrelationIdMiddleware);
app.use("/api/v1", v1Routes);

app.use(appErrorHandler);

app.listen(serverConfig.PORT, () => {
  logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
  logger.info(`Press Ctrl+C to stop the server.`);
  connectDB();
});
