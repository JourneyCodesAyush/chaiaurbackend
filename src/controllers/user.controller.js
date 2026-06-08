import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // Get user details from frontend
    // Validation - Not empty
    // Check if user already exists: username, email
    // Check for images, check for avatar
    // Upload them to cloudinary, avatar
    // Create user object - create entry in DB
    // Remove password and refresh token field from response
    // Check for user creation
    // Return response  

    // console.log("Route hit");
    // console.log("BODY:", req.body);
    // console.log("FILES:", req.files);

    const { fullName, email, username, password } = req.body;
    // console.log(`email: ${email}`);

    // if (fullName === "") {
    //     throw new ApiError(400, "fullname is required");
    // }

    if (
        [fullName, email, username, password].some((field) => { return field?.trim() === "" })
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        // console.log("User with email '" + email + "' and or username '" + username + "' already exists.")
        // throw new ApiError(409, "User with email '" + email + "' and or username '" + username + "' already exists.")
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    // This is a JS issue
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // console.log("Avatar local path:", avatarLocalPath);
    // console.log("Cover local path:", coverImageLocalPath);

    const avatar = await uploadFileOnCloudinary(avatarLocalPath);
    // console.log("Avatar upload result:", avatar);
    const coverImage = await uploadFileOnCloudinary(coverImageLocalPath);
    // console.log("Cover upload result:", coverImage);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(
            200,
            createdUser,
            "User register successfully"
        )
    )
})

export { registerUser }