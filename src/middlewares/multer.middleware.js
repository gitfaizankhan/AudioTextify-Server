import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // const uniqueSuffex = Date.now() + '_' + Math.round(Math.random() * 1E9);
    cb(null, file.originalname); // check file with console
  },
});

export const upload = multer({
  storage: storage,
});
