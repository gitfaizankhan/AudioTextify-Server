import express from "express";
import multer from "multer";
import {
  getAllFile,
  transcribeAudio,
  modifyFileName,
  deleteFileName,
} from "../controllers/transcribe.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Use multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post("/transcribe", verifyJWT, upload.single("audio"), transcribeAudio);
router.route("/allfile").get(verifyJWT, getAllFile);
router.route("/modify/:id").patch(verifyJWT, modifyFileName);
router.route("/delete/:id").delete(verifyJWT, deleteFileName);
export default router;
