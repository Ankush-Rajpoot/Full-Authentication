import {Router} from "express"
import { loginUser, registerUser,logoutUser, refreshAccessToken, verifyEmail,forgotPassword,
	resetPassword,checkAuth} from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();
router.route("/check-auth").get(verifyJWT,checkAuth)
router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/verify-email").post(verifyEmail)
router.route("/forgot-password").post(forgotPassword)
router.route("/reset-password/:token").post(resetPassword)

export default router
