import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        // console.log("tokens from function generateAccessAndRefreshToken", refreshToken, accessToken)

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};


export const register = asyncHandler(async (req, res) => {
    //name, phone, email, role, password, username
    const { name, phoneNo, email, role, password, username } = req.body;

    if (!name || !email || !phoneNo || !password || !role || !username) {
        throw new ApiError(400, "Please enter all the credentials");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const user = await User.create({
        username,
        email,
        password,
        phoneNo,
        role,
        name,
    });

    // Generate tokens upon successful registration
    // const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    // console.log(accessToken, "refresh token ", refreshToken);

    // Return the tokens along with the user data in the response
    return res
        .status(201)
        .json(new ApiResponse(200, user, "User registered successfully"));
});


export const login = asyncHandler(async (req, res) => {
    const { email, role, password } = req.body;

    if (!(email || role || password)) {
        throw new ApiError(400, "Please provide email, password and role");
    }

    const user = await User.findOne({
        $or: [{ email }],
    });
    if (!user) {
        throw new ApiError(400, "user does not exists");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid password");
    }
    if (user.role !== role) {
        throw new ApiError(400, "User with provided role does not exists");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    console.log(accessToken, refreshToken);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    //cookies generation

    //anyone can edit the cookies but we don't want that so we use following code to ensure that only the server can edit or modify the cookies
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        );
});

export const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, {
        $unset: {
            refreshToken: 1
        }
    },
        // Options object: Here, { new: true } is specified, which means that Mongoose should return the modified document rather than the original document
        {
            new: true,
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(201)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
});

export const getUser = asyncHandler((req, res) => {
    const user = req.user
    return res
        .status(201)
        .json(new ApiResponse(200, user))
})
