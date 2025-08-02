const Subject = require("../models/subject");



module.exports.QuesPaperForm = async (req, res) => {
    const { semId } = req.params;
    const subjects = await Subject.find({ semester: semId });
    res.render("questionPaper/upload", { semId, subjects });
  }


// Route to handle the file upload  
module.exports.QuesPaperUpload = async (req, res) => {
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
  }  


//route to show papers  
module.exports.showPaper = async (req, res) => {
    const { subjectId } = req.params;
    const subject = await Subject.findById(subjectId);

    if (!subject) {
      req.flash("error", "Subject not found");
      return res.redirect(`/semesters/${req.params.semId}`);
    }

    res.render("questionPaper/show", { subject });
  }  


//paper delete route  
module.exports.delPaper = async (req, res) => {
  const { subjectId, paperId } = req.params;

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    return res.status(404).send("Subject not found");
  }

  subject.papers.pull(paperId); // This removes the subdocument
  await subject.save();

  req.flash("success", "Paper deleted successfully!");
  res.redirect(`/question-papers/subject/${subjectId}`);
}  