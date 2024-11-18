import express from "express";
import {
  signup,
  login,
  //   fetchUserDetails,
  //   fetchEmails,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
// router.get("/users/:userId", fetchUserDetails);
// router.get("/users/:userId/emails", fetchEmails);
export default userRouter;
