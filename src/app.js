import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session"; // ✅ Add this
import passport from "passport"; // ✅ Needed in main file too

import strategy from "./utils/googleStrategy.js";

dotenv.config({ quiet: true });

const app = express();

// cors implementation
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// ✅ Configure express-session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultSecret", // secure in .env
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true in production with HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// ✅ Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth strategy
strategy(app);

// Routes
import userRouter from "./routes/user.routes.js";
import transcribe from "./routes/transcribe.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/audio", transcribe);

export { app };
