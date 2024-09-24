import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

const generateAccessAndRefreshTokens=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        
        user.refreshToken=refreshToken
        await user.save({
            validateBeforeSave:false
        })
        return {accessToken,refreshToken}
    }
    catch (error) {
        throw new ApiError(500,"Something went wrong while generating the refresh and access token")
    }
}

const registerUser=asyncHandler(async(req,res)=>{
    const {fullName,username,email,password}=req.body

    console.log(req.body);

    if(
        [fullName,username,email,password].some((field) => field?.trim()==="")){
        throw new ApiError(400,"All fields are required")
    }


    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }

    const user=await User.create({
        fullName,
        username:username?.toLowerCase(),
        email,
        password
    })

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const createdUser=await User.findById(user._id)
    .select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }
    const options = { httpOnly: true, secure: true };


  // Send welcome email after successful registration
  try {
    await sendEmail({
      email: user.email,
      subject: 'Welcome to LegalYouToday!',
      name: user.fullName, // Pass the user's name for use in the HTML
    });
  } catch (error) {
    console.error("Error sending welcome email:", error.message);
    // Continue with registration even if the email fails
  }
  
    return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            createdUser,
            "User registered and logged in successfully"
        )
    )
})

const loginUser=asyncHandler(async(req,res)=>{
    const {username,email,password}=req.body
    if(!username && !email){
        throw new ApiError(400,"username or email is required")
    }

    const user=await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(401,"User does not exists")
    }

    const isPasswordValid= await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

    const loggedInUser=await User.findById(user._id)
    .select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,
                accessToken,refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged Out"))
})


const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }

   try {
     const decodedToken=jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
     )
     const user=await User.findById(decodedToken?._id)
     if(!user){
         throw new ApiError(401,"invalid Refresh Token")
     }
     if(incomingRefreshToken!==user?.refreshToken){
         throw new ApiError(401,"Refresh Token is expired or used")
     }
     const options={
         httpOnly:true,
         secure:true
     }
     const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
 
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",newRefreshToken,options)
     .json(
         new ApiResponse(
             200,
             {
                 accessToken,
                 refreshToken:newRefreshToken
             },
             "Access Token Refreshed"
         )
     )
   }
   catch (error) {
    throw new ApiError(401,error?.message || "Invalid Refresh Token")
   }
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken,
    generateAccessAndRefreshTokens
}