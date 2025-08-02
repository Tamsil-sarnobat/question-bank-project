const express = require("express");
const ExpressError = require("../utils/ExpressError");
const router = express.Router({ mergeParams: true });
const multer = require("multer");
const { storage } = require("../cloudConfig");
const { cloudinary } = require("../cloudConfig");
const wrapAsync = require("../utils/wrapAsync.js");

const questionPaper = require("../controllers/questionPaper.js");

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
const {
  userSchema,
  feedbackSchema,
  questionPaperSchema,
} = require("../schema.js");
const Joi = require("joi");

//questionpaper validate middleware
const validateUpload = (req, res, next) => {
  const { error } = questionPaperSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(msg, 400);
  }
  next();
};

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


router.get(
  "/semester/:semId/upload",
  isLoggedIn,
  isTeacher,
  wrapAsync(questionPaper.QuesPaperForm)
);


// Route to handle the file upload
router.post(
  "/semester/:semId/upload",
  isLoggedIn,
  isTeacher,
  upload.single("file"),
  validateUpload,
  wrapAsync(questionPaper.QuesPaperUpload)
);


//route to show papers
router.get(
  "/question-papers/subject/:subjectId",
  isLoggedIn,
  wrapAsync(questionPaper.showPaper)
);

//paper delete route
router.delete("/question-papers/:subjectId/papers/:paperId", isTeacher, wrapAsync(questionPaper.delPaper));

module.exports = router;



