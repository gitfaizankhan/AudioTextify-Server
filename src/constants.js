// constants.js

export const DB_NAME = "speech_to_text_db";

export const HTTP_STATUS = {
  OK: 200, // For successful GET, status check
  CREATED: 201, // For successful file uploads or resource creation
  BAD_REQUEST: 400, // For invalid input, missing audio file, or wrong format
  UNAUTHORIZED: 401, // If you implement login/auth (e.g., protected transcription history)
  SERVER_ERROR: 500, // For Whisper API errors or internal server failures
  NOT_FOUND: 404, // If transcription job or audio file is not found
  CONFLICT: 409, // If the same audio is submitted multiple times and you handle duplicates
};

export const NODE_ENV = process.env.NODE_ENV || "development";

export const RESPONSE_MESSAGES = {
  SUCCESS: {
    OK: "Request completed successfully.",
    CREATED: "Resource created successfully.",
    UPDATED: "Resource updated successfully.",
    DELETED: "Resource deleted successfully.",
    TRANSCRIPTION_STARTED: "Transcription started successfully.",
    TRANSCRIPTION_COMPLETED: "Transcription completed successfully.",
  },

  ERROR: {
    SERVER_ERROR: "Something went wrong. Please try again later.",
    BAD_REQUEST: "Invalid request. Please check your input.",
    UNAUTHORIZED: "Authentication required or failed.",
    FORBIDDEN: "You do not have permission to access this resource.",
    NOT_FOUND: "Requested resource not found.",
    CONFLICT: "Conflict occurred. Possibly a duplicate request.",
    UPLOAD_FAILED: "File upload failed. Please try again.",
    TRANSCRIPTION_FAILED: "Transcription process failed. Please retry.",
  },
};
