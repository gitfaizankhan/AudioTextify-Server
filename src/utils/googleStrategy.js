import dotenv from "dotenv";
import googleStra from "passport-google-oauth20";
import passport from "passport";
import googleAuth from "../middlewares/googleAuth.js";

dotenv.config();

const googleStrategy = googleStra.Strategy;

const strategy = (app) => {
  passport.use(
    new googleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK,
      },
      (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  app.get(
    "/api/v1/auth/google",
    passport.authenticate("google", {
      scope: ["email", "profile"],
      prompt: "select_account",
    })
  );

  app.get(
    "/api/v1/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: process.env.FAILUREURL,
    }),
    googleAuth,
    async (req, res, next) => {
      res.redirect(process.env.SUCCESS_URL);
    }
  );
};

export default strategy;
