import mongoose, { Schema } from "mongoose";

const transcriptSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalFile: {
      data: Buffer,
      contentType: String,
      originalName: String,
    },
    transcribedTextFile: {
      data: Buffer,
      contentType: String,
      originalName: String,
    },
    language: {
      type: String,
      default: "en",
    },
    model: {
      type: String,
      default: "whisper-1", // or your default speech model
    },
  },
  {
    timestamps: true,
  }
);

export const Transcript = mongoose.model("Transcript", transcriptSchema);
