import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { jobseekerDeleteApplication, jobseekerGetAllApplications, postApplication, recruiterGetAllApplications } from "../controller/application.controller.js";

const router = Router()

router.route("/post").post(verifyJWT, postApplication)// /post
router.route("/recruiter/getall").get(verifyJWT, recruiterGetAllApplications)// /employer/getall
router.route("/jobseeker/getall").get(verifyJWT, jobseekerGetAllApplications)// /jobseeker/getall
router.route("/delete/:id").delete(verifyJWT, jobseekerDeleteApplication)// /delete/:id

export default router;
