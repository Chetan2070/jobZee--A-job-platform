import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";


export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (req.path === "/api/v1/user/register") {
            return next(); // Skip verification
        }

        if (!token) {
            throw new ApiError(401, "Token either not generated or missing")
        }
        // jwt.verify is used to verify the authenticity and integrity of a JWT. It checks whether the token is valid, whether it has been tampered with, and whether it has expired.
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // If the token is valid and passes verification, jwt.verify returns the decoded payload of the token.
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "Invalid access token")
        }

        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token or token missing")
    }
})