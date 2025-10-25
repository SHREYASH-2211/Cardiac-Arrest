import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserAccountDetails
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, verifyUser } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    }
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// Secured routes
router.route("/logout").post(verifyJWT, verifyUser, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, verifyUser, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, verifyUser, getCurrentUser);
router.route("/update-account").patch(verifyJWT, verifyUser, updateUserAccountDetails);

export default router;
