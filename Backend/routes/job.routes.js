import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { getSingleJob, deleteJob, getAllJobs, getMyJobs, postJobs, updateJob } from "../controller/job.controller.js";

const router = Router()

router.route("/getall").get(verifyJWT, getAllJobs)//getall
router.route("/post").post(verifyJWT, postJobs)//post
router.route("/getmyjobs").get(verifyJWT, getMyJobs)//getmyjobs
//put is used when we want to update
router.route("/update/:id").put(verifyJWT, updateJob)//update/:id
router.route("/delete/:id").delete(verifyJWT, deleteJob)///delete/:id
router.route("/:id").get(verifyJWT, getSingleJob)// /:id
export default router;
