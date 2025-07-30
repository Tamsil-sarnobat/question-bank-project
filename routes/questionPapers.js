const express = require("express");
const ExpressError = require("../utils/ExpressError");
const router = express.Router({ mergeParams: true });
const multer = require("multer");
const { storage } = require("../cloudConfig");
const { cloudinary } = require("../cloudConfig");
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
const Subject = require("../models/subject");
const wrapAsync = require("../utils/wrapAsync.js");
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
  wrapAsync(async (req, res) => {
    const { semId } = req.params;
    const subjects = await Subject.find({ semester: semId });
    res.render("questionPaper/upload", { semId, subjects });
  })
);

// Route to handle the file upload
router.post(
  "/semester/:semId/upload",
  isLoggedIn,
  isTeacher,
  upload.single("file"),
  validateUpload,
  wrapAsync(async (req, res) => {
    const { error } = questionPaperSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    if (!req.file) {
      return res.status(400).send("File is required.");
    }

    const { semester, subjectId, year, examType } = req.body;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      req.flash("error", "Subject not found.");
      return res.redirect(`/semesters/${req.params.semId}`);
    }

    const newPaper = {
      year,
      examType,
      file: {
        url: req.file.path,
        filename: req.file.filename,
      },
    };

    subject.papers.push(newPaper);
    await subject.save();

    req.flash("success", "Question paper uploaded successfully!");
    res.redirect(`/semesters/${req.params.semId}`);
  })
);


//route to show papers

router.get(
  "/question-papers/subject/:subjectId",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { subjectId } = req.params;
    const subject = await Subject.findById(subjectId);

    if (!subject) {
      req.flash("error", "Subject not found");
      return res.redirect(`/semesters/${req.params.semId}`);
    }

    res.render("questionPaper/show", { subject });
  })
);

//paper delete route
router.delete("/question-papers/:subjectId/papers/:paperId", isTeacher, async (req, res) => {
  const { subjectId, paperId } = req.params;

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    return res.status(404).send("Subject not found");
  }

  subject.papers.pull(paperId); // This removes the subdocument
  await subject.save();

  req.flash("success", "Paper deleted successfully!");
  res.redirect(`/question-papers/subject/${subjectId}`);
});

module.exports = router;



