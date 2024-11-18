import express from "express";
import {
  syncEmails,
  streamEmailUpdates,
} from "../controllers/emailController.js";

const router = express.Router();

router.get("/sync", syncEmails);
router.get("/updates", streamEmailUpdates); // Use the SSE function

export default router;
