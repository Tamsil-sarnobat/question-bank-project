const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const questionPaperSchema = new mongoose.Schema({
    title: String,
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject"
    },
    fileUrl: String,
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

const QuestionPaper = mongoose.model("QuestionPaper", questionPaperSchema);
module.exports = QuestionPaper;