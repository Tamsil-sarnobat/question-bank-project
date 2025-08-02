const express = require('express');
const router = express.Router({ mergeParams: true });
const subject = require("../controllers/subject.js");

const wrapAsync = require("../utils/wrapAsync.js");
const {Subjects} = require("../schema.js");



//isTeacher/admin
const isTeacher = async (req,res,next)=>{
  if(req.user && req.user.role ===  "teacher"){
    return next();
  }
  req.flash("error",
    "Access denied: This feature is restricted to teachers only.");
  return res.redirect("/");
}


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


//subject routes
router.get("/new",isLoggedIn, isTeacher, subject.subjectRoute);


// POST: Create new subject for a semester
router.post("/", isTeacher, wrapAsync(subject.createSubject));


module.exports = router;

