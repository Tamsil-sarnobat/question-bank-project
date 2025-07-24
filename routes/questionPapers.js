const express = require("express");
const router = express.Router();
const Subject = require("../models/subject");

router.get("/upload", async(req,res) => {
    const subjects = await Subject.find({});
    res.render("questionPaper/upload.ejs", {subjects}); 
});

module.exports = router;

