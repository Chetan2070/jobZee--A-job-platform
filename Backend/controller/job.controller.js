import { Job } from "../models/job.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getAllJobs = asyncHandler(async (req, res) => {

    const jobs = await Job.find({ expired: false })

    return res
        .status(201)
        .json(new ApiResponse(200, jobs))
})

export const postJobs = asyncHandler(async (req, res) => {

    const { role } = req.user
    if (role === "Job Seeker") {
        throw new ApiError(400, "Job seeker is not allowed to access the resources")
    }

    const { title, description, category, country, city, location, fixedSalary, salaryFrom, salaryTo } = req.body

    if (!(title || description || category || country || city || location)) {
        throw new ApiError(400, "Fill all the fields")
    }
    if ((fixedSalary && (salaryFrom || salaryTo)) || (!fixedSalary && !(salaryFrom && salaryTo))) {
        throw new ApiError(400, "Please provide either a fixed salary or a salary range, but not both");
    }

    const postedBy = req.user._id
    const job = await Job.create({ title, description, category, country, city, location, fixedSalary, salaryFrom, salaryTo, postedBy })

    return res
        .status(201)
        .json(new ApiResponse(200, job, "Job posted successfully"))
})

export const getMyJobs = asyncHandler(async (req, res) => {
    const { role } = req.user

    if (role === "Job Seeker") {
        throw new ApiError(400, "Job seeker is not allowed to access the resources")
    }
    const myJobs = await Job.find({ postedBy: req.user._id })

    return res
        .status(201)
        .json(new ApiResponse(200, myJobs))
})

export const updateJob = asyncHandler(async (req, res) => {
    const { role } = req.user

    if (role === "Job Seeker") {
        throw new ApiError(400, "Job seeker is not allowed to access the resources")
    }

    const { id } = req.params
    let job = await Job.findById(id)

    if (!job) {
        throw new ApiError(404, "Job not found")
    }
    //in findByIdAndUpdate we give three parameters first is the id which has to be changed, second data that comes from the body and third ids to reflect the changes
    job = await Job.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    return res
        .status(201)
        .json(new ApiResponse(200, job))

})

export const deleteJob = asyncHandler(async (req, res) => {
    const { role } = req.user

    if (role === "Job Seeker") {
        throw new ApiError(400, "Job seeker is not allowed to access the resources")
    }

    const { id } = req.params
    let job = await Job.findById(id)

    if (!job) {
        throw new ApiError(404, "Job not found")
    }

    await job.deleteOne()
    return res
        .status(201)
        .json(new ApiResponse(200, "Job deleted successfully"))

})

export const getSingleJob = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    try {
        const job = await Job.findById(id);
        if (!job) {
            throw new ApiError("Job not found.", 404)
        }
        return res.status(201).json(
            new ApiResponse(200, job)
        );
    } catch (error) {
        throw new ApiError(`Invalid ID / CastError`, 404)
    }
});