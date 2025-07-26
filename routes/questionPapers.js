const express = require("express");
const router = express.Router();
const Subject = require("../models/subject");
const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only PDF or image files (JPG/PNG) are allowed."));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
const Paper = require("../models/questionPaper");
const wrapAsync = require("../utils/wrapAsync.js");
const {
  userSchema,
  feedbackSchema,
  questionPaperSchema,
} = require("../schema.js");
const ExpressError = require("../utils/ExpressError");

//is Logged in middlewares (will remove later as it is defined in app.js)
const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    console.log(req.session.redirect);
    req.flash("error", "User Must Be Logged In!");
    return res.redirect("/semester/login");
  }
  next();
};

//isTeacher/admin (will remove later as it is defined in app.js)
const isTeacher = async (req, res, next) => {
  if (req.user && req.user.role === "teacher") {
    return next();
  }
  req.flash(
    "error",
    "Access denied: This feature is restricted to teachers only."
  );
  return res.redirect("/");
};

//questionpaper validate middleware
const validateUpload = (req, res, next) => {
  const { error } = questionPaperSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(msg, 400);
  }
  next();
};

router.get(
  "/upload/semester/:semId",
  isLoggedIn,
  isTeacher,
  wrapAsync(async (req, res) => {
    const semId = parseInt(req.params.semId);
    const Subjects = await Subject.find({ semester: semId }); // Find subjects by semId
    console.log("Subjects found for semId", semId, Subjects); // DEBUG LINE
    res.render("questionPaper/upload", { semester: semId, Subjects }); // Pass semester and Subjects
  })
);

// POST /upload-paper
router.post(
  "/upload-paper",
  isLoggedIn,
  isTeacher,
  upload.single("file"),
  validateUpload,
  wrapAsync(async (req, res) => {
    const { subject, semester } = req.body;
    const file = req.file;

    // ===== Manual File Validation =====
    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!file) {
      req.flash("error", "File is required!");
      return res.redirect("back");
    }

    const isImage = file.mimetype.startsWith("image/");
    const maxSize = isImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024;

    if (file.size > maxSize) {
      req.flash(
        "error",
        isImage
          ? "Image size should not exceed 5MB."
          : "PDF size should not exceed 10MB."
      );
      return res.redirect("back");
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      req.flash("error", "Only PDF or image files (JPG/PNG) are allowed.");
      return res.redirect("back");
    }

    const paper = new Paper({
      subject,
      semester,
      file: {
        url: file.path,
        filename: file.filename,
        type: file.mimetype.includes("pdf") ? "pdf" : "image",
      },
      uploadedBy: req.user._id,
    });

    await paper.save();
    res.redirect(`/semesters/${semester}/subjects/${subject}`);
  })
);

module.exports = router;
