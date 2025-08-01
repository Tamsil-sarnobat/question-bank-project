const express = require('express');
const router = express.Router({ mergeParams: true });
const ExpressError = require("../utils/ExpressError");
const feedback = require("../controllers/feedback.js");

const wrapAsync = require("../utils/wrapAsync.js");
const { feedbackSchema} = require("../schema.js");



const validateFeedback = (req,res,next) => {
  console.log(req.body);
  const {error} = feedbackSchema.validate(req.body);
  if(error) { 
    throw new ExpressError(404, error.details[0].message);
  }
  next();
};


//is Logged in middlewares
const isLoggedIn = (req,res,next)=>{
  if(!req.isAuthenticated()){
      req.session.redirectUrl = req.originalUrl;
      console.log(req.session.redirect);
      req.flash("error","User Must Be Logged In!");
      return res.redirect("/semester/login");
  }
  next();
  
}



//feedback form routes
router.get("/new", isLoggedIn,feedback.FeedbackForm);

//feedback page route
router.get("/", wrapAsync(feedback.feedbackPage));

//feedback delete route
router.delete("/:id", wrapAsync(feedback.feedbackDelete));

//feedback post
router.post("/",validateFeedback, isLoggedIn , wrapAsync(feedback.feedbackPost));


module.exports = router;