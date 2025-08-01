import { Router } from "express";
import {
  changeCurrentUserPassword,
  getCurrentUser,
  loginUser,
  getAccess,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  forgotPassword,
  getOtpExpTime,
  verifyOtp,
  updatePassword,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Register User Route
// http://localhost:8080/api/v1/users/register
router.route("/register").post(registerUser);

// Login User Route
// http://localhost:8080/api/vi/users/login
router.route("/login").post(loginUser);

router.route("/access").get(verifyJWT, getAccess);
// Logout User Route
// http://localhost:8000/api/v1/users/logout
router.route("/logout").post(verifyJWT, logoutUser);

// refresh token
// http://localhost:8000/api/v1/users/refresh-token
router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changeCurrentUserPassword);

router.route("/current-user").get(verifyJWT, getCurrentUser);

router.route("/update-account").patch(verifyJWT, updateAccountDetails);

router.route("/password/forget").post(forgotPassword);

router.route("/otp/exp").get(verifyJWT, getOtpExpTime);

router.route("/otp/verify").post(verifyOtp);

router.route("/password/update").post(verifyJWT, updatePassword);

export default router;
