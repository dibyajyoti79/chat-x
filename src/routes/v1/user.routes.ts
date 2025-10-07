import express from "express";
import userController from "../../controllers/user.controller";
import { signupSchema } from "../../validators/user.validator";
import { validateRequestBody } from "../../validators";

const userRouter = express.Router();

userRouter.post(
  "/signup",
  validateRequestBody(signupSchema),
  userController.signup
);

export default userRouter;
