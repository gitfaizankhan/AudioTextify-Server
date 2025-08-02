import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import { app } from "./app.js";
import { ApiError } from "./utils/ApiError.js";

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });

    // If server fails to bind or crashes ==> Port already in use
    server.on("error", (error) => {
      console.error("❌ Server error:", error);
      throw new ApiError(500, "Server failed to start");
    });

    // when you press Ctrl+C in the terminal to interrupt the process SIGINT -> Signal Interrupt.
    process.on("SIGINT", () => {
      console.log("🛑 SIGINT received. Closing server.");
      server.close(() => process.exit(0));
    });

    // process to request graceful termination. allows cleanup before exiting. SIGTERM -> Signal Terminate
    process.on("SIGTERM", () => {
      console.log("🛑 SIGTERM received. Closing server.");
      server.close(() => process.exit(0));
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
};

startServer();
