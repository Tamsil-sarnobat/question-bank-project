const mongoose = require("mongoose");

const subjectSchema  = new mongoose.Schema({
    name: String,
    semester: Number
});

const Subject = mongoose.model("Subject", subjectSchema);

module.exports = Subject;
