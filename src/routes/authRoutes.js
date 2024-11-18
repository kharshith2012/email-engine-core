import express from "express";
import {
  authOutlook,
  authOutlookCallback,
} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.get("/outlook", authOutlook);
authRouter.get("/outlook/callback", authOutlookCallback);

export default authRouter;
