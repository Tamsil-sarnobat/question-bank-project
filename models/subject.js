const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: String,
  semester: Number,
  papers: [
    {
      year: Number,
      examType: String,
      file: {
        url: String,
        filename: String,
      },
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Subject = mongoose.model("Subject", subjectSchema);

module.exports = Subject;
