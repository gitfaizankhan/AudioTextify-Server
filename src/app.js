import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";

import strategy from "./utils/googleStrategy.js";

dotenv.config({ quiet: true });

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
    secret: process.env.SESSION_SECRET || "defaultSecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true when deployed with HTTPS
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
