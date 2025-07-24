const multer = require("multer");
const path = require("path");

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Folder to store files
  },
  filename: function (req, file, cb) {
    // Save with original name + timestamp
    cb(null, Date.now() + "-" + file.originalname);
  }
});

// File filter (allow PDFs only)
const fileFilter = function (req, file, cb) {
  const allowedTypes = /pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;