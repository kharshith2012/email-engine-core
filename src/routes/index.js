import express from "express";
import userRouter from "./userRoutes.js";
import authRouter from "./authRoutes.js";
import emailRoutes from "./emailRoutes.js";

const router = express.Router();

router.use("/user", userRouter);
router.use("/auth", authRouter);
router.use("/email", emailRoutes);

export default router;
