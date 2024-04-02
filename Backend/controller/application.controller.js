import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import cloudinary from "cloudinary";

export const postApplication = asyncHandler(async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
        throw new ApiError("Employer are not allowed to access this resource.", 400)
    }
    if (!req.files || Object.keys(req.files).length === 0) {
        throw new ApiError("Resume File Required!", 400);
    }

    const { resume } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(resume.mimetype)) {
        throw new ApiError("Invalid file type. Please upload a PNG file.", 400)
    }

    const cloudinaryResponse = await cloudinary.uploader.upload(
        resume.tempFilePath
    );

    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error(
            "Cloudinary Error:",
            cloudinaryResponse.error || "Unknown Cloudinary error"
        );
        throw new ApiError("Failed to upload Resume to Cloudinary", 500)
    }
    const { name, email, coverLetter, phone, address, jobId } = req.body;

    const applicantID = {
        user: req.user._id,
        role: "Job Seeker",
    };

    if (!jobId) {
        throw new ApiError("Job not found!", 404)
    }
    const jobDetails = await Job.findById(jobId);
    if (!jobDetails) {
        throw new ApiError("Job not found!", 404)
    }

    const employerID = {
        user: jobDetails.postedBy,
        role: "Employer",
    };
    if (
        !name ||
        !email ||
        !coverLetter ||
        !phone ||
        !address ||
        !applicantID ||
        !employerID ||
        !resume
    ) {
        throw new ApiError("Please fill all fields.", 400)
    }
    const application = await Application.create({
        name,
        email,
        coverLetter,
        phone,
        address,
        applicantID,
        employerID,
        resume: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
    });
    res.status(201).json(new ApiResponse(200, "Application Submitted!", application))

});

export const recruiterGetAllApplications = asyncHandler(async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
        throw new ApiError("Job Seeker not allowed to access this resource.", 400)
    }
    const { _id } = req.user;
    const applications = await Application.find({ "recruiterID.user": _id });
    res.status(200).json(new ApiResponse(200, applications));
});

export const jobseekerGetAllApplications = asyncHandler(async (req, res, next) => {
    const { role } = req.user;
    if (role === "Recruiter") {
        throw new ApiError(400, "Recruiter is not allowed to access this resource.")

    }
    const { _id } = req.user;
    const applications = await Application.find({ "applicantID.user": _id });
    return res.status(201).json(new ApiResponse(200, applications));
});

export const jobseekerDeleteApplication = asyncHandler(async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
        return next(
            new ErrorHandler("Employer not allowed to access this resource.", 400)
        );
    }
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
        return next(new ErrorHandler("Application not found!", 404));
    }
    await application.deleteOne();
    return res.status(201).json(new ApiResponse(200, "Application Deleted!"));
});
