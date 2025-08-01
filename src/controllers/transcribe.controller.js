import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { Transcript } from "../models/transcribe.model.js"; // adjust path if needed
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transcribeAudio = async (req, res) => {
  try {
    const audioFilePath = path.join(
      __dirname,
      "../../public",
      req.file.filename
    );

    const python = spawn("python", [
      "./src/whisper/transcribe.py",
      audioFilePath,
    ]);

    let data = "";

    python.stdout.on("data", (chunk) => {
      data += chunk.toString();
    });

    python.stderr.on("data", (err) => {
      console.error("Python Error:", err.toString());
    });

    python.on("close", async (code) => {
      if (code !== 0) {
        return res
          .status(500)
          .json({ message: "Whisper failed to transcribe" });
      }

      try {
        const result = JSON.parse(data);
        const originalText = result.text;

        const textFileName = `${req.file.filename}_stt.txt`;
        const textFilePath = path.join(__dirname, "../../public", textFileName);

        // Save transcribed text to file
        await fs.promises.writeFile(textFilePath, originalText);

        // Read files as Buffer
        const originalBuffer = await fs.promises.readFile(audioFilePath);
        const textBuffer = await fs.promises.readFile(textFilePath);

        // Save to MongoDB
        const transcriptionEntry = new Transcript({
          user: req.user._id,
          originalFile: {
            data: originalBuffer,
            contentType: req.file.mimetype,
            originalName: req.file.originalname,
          },
          transcribedTextFile: {
            data: textBuffer,
            contentType: "text/plain",
            originalName: textFileName,
          },
          language: req.body.language || "en",
          model: req.body.model || "whisper-1",
        });

        await transcriptionEntry.save();

        // Delete files permanently from disk
        await fs.promises.unlink(audioFilePath);
        await fs.promises.unlink(textFilePath);
        return res.status(200).json({
          status: 200,
          message: "Transcription completed, saved and files deleted",
          transcript: originalText,
        });
      } catch (parseErr) {
        return res.status(500).json({
          message: "Invalid JSON from Python",
          error: parseErr.message,
        });
      }
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error in transcription",
      error: err.message,
    });
  }
};

const getAllFile = async (req, res) => {
  try {
    const userId = req.user._id;

    const userFiles = await Transcript.find({ user: userId });

    if (!userFiles || userFiles.length === 0) {
      return res.status(404).json({ message: "No files found for the user" });
    }

    // Send file data directly as buffer and content type
    const fileData = userFiles.map((file) => ({
      id: file._id,
      audio: file.originalFile?.data
        ? {
            buffer: file.originalFile.data.toString("base64"),
            contentType: file.originalFile.contentType,
            originalName: file.originalFile.originalName,
          }
        : null,
      text: file.transcribedTextFile?.data
        ? {
            buffer: file.transcribedTextFile.data.toString("utf-8"),
            contentType: file.transcribedTextFile.contentType,
            originalName: file.transcribedTextFile.originalName,
          }
        : null,
    }));

    return res.status(200).json({
      message: "File data fetched successfully",
      fileData,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const modifyFileName = async (req, res) => {
  const { newFileName } = req.body;
  const transcriptId = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(transcriptId)) {
      return res.status(400).json({ message: "Invalid transcript ID" });
    }

    if (!newFileName) {
      return res.status(400).json({ message: "New file name is required" });
    }

    const transcript = await Transcript.findById(transcriptId);

    if (!transcript) {
      return res.status(404).json({ message: "Transcript not found" });
    }
    transcript.transcribedTextFile.originalName = newFileName;
    await transcript.save();

    return res.status(200).json({
      success: true,
      message: "File name updated successfully",
      updatedFile: transcript.transcribedTextFile,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteFileName = async (req, res) => {
  try {
    const transcriptId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(transcriptId)) {
      return res.status(400).json({ message: "Invalid transcript ID" });
    }

    const transcript = await Transcript.findById(transcriptId);

    if (!transcript) {
      return res.status(404).json({ message: "Transcript not found" });
    }

    // Optional: Check if the user making the request is the owner
    if (transcript.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this file" });
    }

    await Transcript.findByIdAndDelete(transcriptId);
    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
      deletedId: transcriptId,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export { transcribeAudio, getAllFile, modifyFileName, deleteFileName };
