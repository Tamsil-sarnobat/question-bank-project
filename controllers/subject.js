const Subject = require("../models/subject.js");

//subject route
module.exports.subjectRoute = (req, res) => {
    const semester = parseInt(req.params.id);
    res.render("subjects/new", { semester});
}

module.exports.createSubject = async (req, res) => {
    const semester = parseInt(req.params.id);
    const { name } = req.body;

    const subject = new Subject({ name, semester });
    await subject.save();

    req.flash("success", "Subject created successfully!");
    res.redirect(`/semesters/${semester}`);
}