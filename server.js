import express from "express";
import session from "express-session";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { Client } from "@elastic/elasticsearch";
import * as msal from "@azure/msal-node";
import config from "./src/config/configs.js";
import router from "./src/routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.locals.users = {};

app.locals.msalClient = new msal.ConfidentialClientApplication(
  config.msalConfig
);
app.locals.esClient = new Client(config.elasticConfig);

app.use(express.json());
app.use(
  session({
    secret: "abcmlou",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/api", router);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/src/views/index.html");
});

app.all("*", (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on the server!`);
  err.status = "fail";
  err.statusCode = 404;
  next(err);
});

app.use((error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  res
    .status(error.statusCode)
    .json({ status: error.status, message: error.message });
});

const PORT = process.env.PORT || 3000;
// Start server
app.listen(3000, async () => {
  console.log(`Server is running on port: ${PORT}`);
});

export { app };
