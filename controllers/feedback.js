const Feedback = require("../models/feedback.js");
const User = require("../models/users");

//feedback form routes
module.exports.FeedbackForm = (req,res) => {
  res.render("feedback/feedback.ejs");
}

//feedback form routes
module.exports.feedbackPage = async (req,res) => {
  const allFeedbacks = await Feedback.find({})
  .sort({ createdAt: -1})
  .populate("user");
  res.render("feedback/feedbackpage.ejs", {allFeedbacks});
}

//feedback delete route
module.exports.feedbackDelete = async (req, res) => {
  const { id } = req.params;
  const feedback = await Feedback.findById(id);

  if (!feedback) {
    req.flash("error", "Feedback not found");
    return res.redirect("/feedback");
  }

  await Feedback.findByIdAndDelete(id);
  req.flash("success", "Feedback deleted successfully");
  res.redirect("/feedback");
}

//feedback post
module.exports.feedbackPost = async (req,res) => {
  const feedback = new Feedback(req.body);
  feedback.user = req.user._id;
  await feedback.save();

  const user = await User.findById(req.user._id);
  user.feedbacks.push(feedback._id);
  await user.save();

  req.flash("success", "Feedback submitted successfully!");
  res.render("feedback/thankyou");
}