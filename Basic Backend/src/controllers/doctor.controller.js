import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { Doctor } from '../models/doctor.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (doctorId) => {
  try {
    const doctor = await Doctor.findById(doctorId);
    const accessToken = doctor.generateAccessToken();
    const refreshToken = doctor.generateRefreshToken();

    doctor.refreshToken = refreshToken;
    await doctor.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Internal server error while generating tokens");
  }
};

const registerDoctor = asyncHandler(async (req, res) => {
  const { fullname, username, email, password, specialization, licenseNumber, hospital, phone } = req.body;

  // Validation
  if ([fullname, username, email, password, specialization, licenseNumber, hospital, phone].some(field => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  if (!email.includes("@")) {
    throw new ApiError(400, "Email is not valid");
  }

  // Check if doctor already exists
  const existedDoctor = await Doctor.findOne({
    $or: [{ username }, { email }, { licenseNumber }]
  });

  if (existedDoctor) {
    throw new ApiError(409, "Username, email or license number already exists");
  }

  // Handle avatar upload if provided
  let avatarUrl = "";
  if (req.files?.avatar?.[0]?.path) {
    const avatar = await uploadOnCloudinary(req.files.avatar[0].path);
    avatarUrl = avatar?.url || "";
  }

  // Create doctor
  const doctor = await Doctor.create({
    fullname,
    username: username.toLowerCase(),
    email,
    password,
    specialization,
    licenseNumber,
    hospital,
    phone,
    avatar: avatarUrl,
  });

  const createdDoctor = await Doctor.findById(doctor._id).select("-password -refreshToken");

  if (!createdDoctor) {
    throw new ApiError(500, "Something went wrong while registering the doctor");
  }

  return res.status(201).json(
    new ApiResponse(200, createdDoctor, "Doctor registered successfully")
  );
});

const loginDoctor = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required");
  }

  const doctor = await Doctor.findOne({
    $or: [{ username }, { email }]
  });

  if (!doctor) {
    throw new ApiError(404, "Doctor does not exist");
  }

  const isPasswordValid = await doctor.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(doctor._id);

  const loggedInDoctor = await Doctor.findById(doctor._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        doctor: loggedInDoctor,
        accessToken,
        refreshToken
      }, "Doctor logged in successfully")
    );
});

const logoutDoctor = asyncHandler(async (req, res) => {
  await Doctor.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1
      }
    },
    {
      new: true
    }
  );

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Doctor logged out successfully"));
});

const getCurrentDoctor = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, req.user, "Doctor fetched successfully")
  );
});

const updateDoctorProfile = asyncHandler(async (req, res) => {
  const { fullname, email, specialization, hospital, phone } = req.body;

  if ([fullname, email, specialization, hospital, phone].some(field => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const doctor = await Doctor.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullname,
        email,
        specialization,
        hospital,
        phone
      }
    },
    {
      new: true
    }
  ).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, doctor, "Doctor profile updated successfully")
  );
});

export {
  registerDoctor,
  loginDoctor,
  logoutDoctor,
  getCurrentDoctor,
  updateDoctorProfile
};
