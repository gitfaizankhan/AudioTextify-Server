import { User } from "../models/user.model.js";

const googleAuth = async (req, res, next) => {
  try {
    const googleData = req?.user?._json;

    if (!googleData) {
      return res.status(400).json({ message: "Google user data missing" });
    }

    const { name, email, sub: googleId } = googleData;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        googleId, // optional but good to store
      });
      await user.save();
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    // Attach user to request for further middlewares
    req.user = {
      _id: user._id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default googleAuth;
