import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import session from "express-session";
import passport from "passport"
import pkg from 'passport-google-oauth2';
const { Strategy: GoogleStrategy } = pkg;
// import userRouter from "./routes/user.router.js"
import { generateAccessAndRefreshTokens } from "./controllers/user.controller.js";
import { User } from "./models/user.model.js";
import sendEmail from "./utils/sendEmail.js";
import dotenv from "dotenv"

dotenv.config();

const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials:true
}))
app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//Setup session
app.use(session({
    secret:process.env.SESSION_SECRET || 'xezfmrEV7hNa1nK4plYhnKvJKdPYvTo0',
    resave:false,
    saveUninitialized:true,
}));

// Passport Setup
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback",
            scope: ["profile", "email"]
        },

    async(googleAccessToken,googleRefreshrefreshToken,profile,done)=>{
        try {
            let user=await User.findOne({googleId:profile.id});
            let isNewUser=false;
            if(!user){
                user =new User({
                    googleId:profile.id,
                    fullName: profile.displayName, // Set fullName from displayName
                    username: profile.emails[0].value.split('@')[0], 
                    email:profile.emails[0].value,
                    image:profile.photos[0].value
            });
            await user.save();
            isNewUser=true;
        }
        const { accessToken: jwtAccessToken, refreshToken: jwtRefreshToken } = await generateAccessAndRefreshTokens(user._id);
        user.accessToken = jwtAccessToken;
        user.refreshToken = jwtRefreshToken;
        if(isNewUser){
            try {
                await sendEmail({
                    email:user.email,
                    subject: 'Welcome to LegalYouToday',
                    name:user.fullName,
                })
            }
            catch (error) {
                console.error("Error sending welcome email:", error.message);
            }
        }
        return done(null,user);
        }
        catch (error) {
            return done(error,null)
        }
    }
))

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback", passport.authenticate("google", {
    
    failureRedirect: "http://localhost:5173/login"
}),
(req,res)=>{
    const {accessToken,refreshToken}=req.user
    const options={
        httpOnly:true,
        secure:true,
    }
    res
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .redirect("http://localhost:5173/profile")
});

app.get("/login/success", async (req, res) => {
    if (req.user) {
        res.status(200).json({ message: "User Logged In", user: req.user });
    }
    else {
        res.status(400).json({ message: "Not Authorized" });
    }
});

app.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect("http://localhost:5173");
    });
});



// import routes
import userRouter from "./routes/user.router.js"

app.use("/api/v1/users",userRouter)
// http://localhost:5000/users/register
export {app}