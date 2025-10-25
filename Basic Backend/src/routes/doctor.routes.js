import { Router } from "express";
import {
  registerDoctor,
  loginDoctor,
  logoutDoctor,
  getCurrentDoctor,
  updateDoctorProfile
} from "../controllers/doctor.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, verifyDoctor } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    }
  ]),
  registerDoctor
);

router.route("/login").post(loginDoctor);

// Secured routes (require authentication)
router.route("/logout").post(verifyJWT, verifyDoctor, logoutDoctor);
router.route("/current-doctor").get(verifyJWT, verifyDoctor, getCurrentDoctor);
router.route("/update-profile").patch(verifyJWT, verifyDoctor, updateDoctorProfile);

export default router;
