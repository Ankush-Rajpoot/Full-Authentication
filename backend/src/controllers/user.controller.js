import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import {
	sendPasswordResetEmail,
	sendResetSuccessEmail,
	sendVerificationEmail,
	sendWelcomeEmail,
} from "../mailtrap/emails.js";


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

    // console.log(req.body);

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

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const user=await User.create({
        fullName,
        username:username?.toLowerCase(),
        email,
        password,
        verificationToken,
        verificationTokenExpiresAt:Date.now()+24*60*60*1000, //24 hours

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


    await sendVerificationEmail(user.email, verificationToken);
  
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

const verifyEmail = asyncHandler(async (req, res) => {
    const { code } = req.body;
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() } 
        });

        if (!user) {
            throw new ApiError(400, "Invalid or expired verification code");
        }

        user.isVerified = true;
        user.verificationToken = undefined; 
        user.verificationTokenExpiresAt = undefined;
        
        await user.save(); 

        await sendWelcomeEmail(user.email, user.fullName);

        const verifiedUser = await User.findById(user._id)
            .select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true
        };

        return res
            .status(200)
            .cookie("verificationStatus", "verified", options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: verifiedUser
                    },
                    "Email verified successfully"
                )
            );
    } catch (error) {
        console.log("Error in verifyEmail: ", error);
        throw new ApiError(500, "Server error");
    }
});

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

    // const isPasswordValid= await user.isPasswordCorrect(password)
    const isPasswordValid = await user.isPasswordCorrect(password);
	if (!isPasswordValid) {
		throw new ApiError(401, "Invalid user credentials");
	}

    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)
    console.log(user);

    const loggedInUser=await User.findById(user._id)
    .select("-password -refreshToken")
    user.lastLogin = new Date();
    await user.save();
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

const forgotPassword=asyncHandler(async(req,res)=>{
    const {email}=req.body;
    try {
        const user=await User.findOne({email});
        if(!user){
            throw new ApiError(401,"User does not exists")
        }
        const resetToken=crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt=Date.now() + 1*60*60*1000 //1 hour
        user.resetPasswordToken=resetToken;
        user.resetPasswordExpiresAt=resetTokenExpiresAt;
        
        await user.save();
    
        // send mail
        await sendPasswordResetEmail(user.email,`${process.env.CORS_ORIGIN}/reset-password/${resetToken}`)
    
        return res
        .status(200)
        .json(new ApiResponse(200,{},"Password reset link sent to your email"))
    
    }
    catch (error) {
        console.log("Error in forgotPassword ",error);
        res.status(400).json({ success: false, message: error.message });
    }
})

const resetPassword=asyncHandler(async(req,res)=>{
    try {
        const {token}=req.params;
        const {password}=req.body;
        const user=await User.findOne({
            resetPasswordToken:token,
            resetPasswordExpiresAt:{$gt:Date.now()},
        });
        if(!user){
            throw new ApiError(401,"Invalid or expired reset token")
        }
        // update password
       
        user.password = password; 

        user.resetPasswordToken=undefined;
        user.resetPasswordExpiresAt=undefined;
    
        await user.save();
    
        await sendResetSuccessEmail(user.email);
        console.log("User after password reset:", user);

        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"Password has been reset successfully")
        )
    }
    catch (error) {
        console.log("Error in resetPassword ",error);
        res.status(400).json({ success: false, message: error.message });  
    }
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

const checkAuth = asyncHandler(async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
});

export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken,
    generateAccessAndRefreshTokens,
    verifyEmail,
    forgotPassword,
    resetPassword,
    checkAuth
}