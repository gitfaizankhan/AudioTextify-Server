import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import sendMail from "../utils/sendMail.js";
import jwt from "jsonwebtoken";

// Generate Access and Refresh Token
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refesh and access tokens"
    );
  }
};

// Registe User
const registerUser = asyncHandler(async (req, res) => {
  // 1. Get user details from frontend
  const { name, email, password } = req.body;

  // 2. validation - not empty
  if (name === "") {
    throw new ApiError(400, "fullname is required");
  } // optional to check data ield empty or not

  if ([name, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // 3. check if user already exists: username, email based check
  const existedUser = await User.findOne({
    $or: [{ email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email already exists");
  }

  // 6. create user object - create entry in db
  const user = await User.create({
    name,
    email,
    password,
  });

  // 7. remove password and refresh token field from response

  const createdUser = await User.findById(user._id) //check for user creation
    .select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  // return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User register Successfully"));
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  // 1. Get user details from req.body
  const { email, password } = req.body;

  // 2. username or email exists or not
  if (!email) {
    throw new ApiError(400, "email is required");
  }
  // 3. find the user
  const user = await User.findOne({
    $or: [{ email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  // 4. compare password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Passowrd is incorrect");
  }

  // 5. generate access token or refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Again FindById and select fields
  const loggedIn = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // 6. send cookies
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
          user: loggedIn,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

// Get Access
const getAccess = async (req, res, next) => {
  try {
    res.status(200).json({ message: "success", status: true });
  } catch (error) {
    next(error);
  }
};

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        // use unset insted of set
        refreshToken: 1, // This remove he field from document
      },
    },
    {
      new: true,
    }
  );

  // clear cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged out successfully"));
});

// Refresh Access Token
const refreshAccessToken = asyncHandler(async (req, res) => {
  // 1. get refresh token from cookies
  const { refreshToken } = req.cookies;

  // 2. check if refresh token exists
  if (!refreshToken) {
    throw new ApiError(400, "Refresh token is required");
  }
  try {
    // 3 verift the refresh token

    const decodedToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // 4. find the user
    const user = await User.findById(decodedToken?._id);

    // 5. check if user exists
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // 6. check if refresh token is valid
    if (user.refreshToken !== refreshToken) {
      throw new ApiError(401, "invalid refresh token");
    }

    // 7. generate new access tokne
    const accessToken = user.generateAccessToken();

    // generate options
    const options = {
      httpOnly: true,
      secure: true,
    };

    // 9. send new access token
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

// Change Current User Password
const changeCurrentUserPassword = asyncHandler(async (req, res) => {
  // 1. get user details
  const { oldPassword, newPassword } = req.body;

  // 2. find the user
  const user = await User.findById(req.user._id);

  // 3. check of old password is correct
  const ispasswordCorrect = await user.isPasswordCorrect(oldPassword);

  // 4. if not correct, throw error
  if (!ispasswordCorrect) {
    throw new ApiError(401, "Old password is incorrect");
  }

  // 5. update the password
  user.password = newPassword;

  // 6. save the user
  await user.save({ validateBeforeSave: false });

  // 7. send response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

// Update Current User
const updateAccountDetails = asyncHandler(async (req, res) => {
  // 1. get user details
  const { fullName, email } = req.body;

  // 2. check if fullname and email exists
  if (!fullName || !email) {
    throw new ApiError(400, "Fullname and email is required");
  }

  // update user
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  // 4. send response
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details updated successfully"));
});

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError("No user found with this email", 404));
    }

    // OTP Handling
    const otpData = user.password_otp;
    const currentTime = new Date().getTime();
    const lastAttemptTime = new Date(otpData.last_attempt_time).getTime();
    const isWithin24Hours =
      currentTime - lastAttemptTime <= 24 * 60 * 60 * 1000;

    // If time limit passed, reset attempts
    if (!isWithin24Hours) {
      user.password_otp.attempts = 5;
    }

    // If attempts are over and within 24 hours
    if (otpData.otp && otpData.attempts === 0 && isWithin24Hours) {
      return next(
        new ApiError(429, "You have reached your daily limit for OTP requests.")
      );
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    user.password_otp.otp = otp;
    user.password_otp.last_attempt_time = new Date();
    user.password_otp.time = currentTime + 2 * 60 * 1000; // 2 minutes validity
    user.password_otp.attempts -= 1;

    await user.save();

    // Send OTP Email
    await sendMail({
      otp,
      receiver: user.email,
    });

    // Create token for further flow
    const { accessToken } = await generateAccessAndRefreshTokens(user._id);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { email: user.email, otp },
          `6-digit OTP sent to ${user.email}`
        )
      );
  } catch (error) {
    next(error);
  }
};

const getOtpExpTime = async (req, res, next) => {
  const id = req.user._id;

  try {
    const findedUser = await User.findById(id);
    res.status(200).json({
      message: "success",
      status: true,
      time: findedUser?.password_otp?.time - new Date().getTime(),
      email: findedUser.email,
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  const { otp } = req.body;

  try {
    const findedUser = await User.findOne({ "password_otp.otp": otp });
    if (!findedUser) {
      const error = new Error("incorrect otp");
      error.statusCode = 400;
      throw error;
    }

    if (findedUser.password_otp.otp === otp) {
      const error = new Error("incorrect otp");
      error.statusCode = 400;
      throw error;
    }

    if (findedUser.password_otp.time - new Date().getTime() <= 0) {
      const error = new Error("otp exipred");
      error.statusCode = 400;
      throw error;
    }

    findedUser.password_otp.status = true;
    await findedUser.save();
    res.status(200).json({ message: "otp verified", status: true });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  const { password } = req.body;
  const id = req.user._id;
  try {
    const findedUser = await User.findById(id);

    if (!findedUser.password_otp.status) {
      const error = new Error("something went wrong");
      error.statusCode = 400;
      throw error;
    }

    findedUser.password = password;
    findedUser.password_otp.status = false;
    await findedUser.save();
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res
      .status(200)
      .json({ message: "password updated successfully", status: true });
  } catch (error) {
    next(error);
  }
};

// Export all functions from this file
export {
  registerUser,
  loginUser,
  getAccess,
  logoutUser,
  refreshAccessToken,
  changeCurrentUserPassword,
  getCurrentUser,
  updateAccountDetails,
  forgotPassword,
  getOtpExpTime,
  verifyOtp,
  updatePassword,
};
