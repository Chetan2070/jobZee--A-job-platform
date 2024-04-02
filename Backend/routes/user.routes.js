import { Router } from "express";
import { getUser, login, logout, register } from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router()

router.route("/register").post(register)
router.route("/login").post(login)
router.route("/logout").get(verifyJWT, logout)
router.route("/getuser").get(verifyJWT, getUser)

export default router;
