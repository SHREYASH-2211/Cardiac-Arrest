import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Doctor } from "../models/doctor.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      (req.header("Authorization")?.startsWith("Bearer ")
        ? req.header("Authorization").replace("Bearer ", "")
        : null);

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Check role and fetch from appropriate model
    let user;
    if (decodedToken.role === "doctor") {
      user = await Doctor.findById(decodedToken?._id).select("-password -refreshToken");
    } else {
      user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    }

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

// Middleware to check if user is a doctor
export const verifyDoctor = asyncHandler(async (req, res, next) => {
  if (req.user?.role !== "doctor") {
    throw new ApiError(403, "Access denied. Doctor privileges required.");
  }
  next();
});

// Middleware to check if user is a regular user
export const verifyUser = asyncHandler(async (req, res, next) => {
  if (req.user?.role !== "user") {
    throw new ApiError(403, "Access denied. User privileges required.");
  }
  next();
});
