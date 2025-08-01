const express = require('express');
const router = express.Router({ mergeParams: true });

const task = require("../controllers/task.js");

const wrapAsync = require("../utils/wrapAsync.js");


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



//tasks page
router.get("/taskPage",isLoggedIn,wrapAsync(task.taskPage));


//task Form
router.get("/task",isLoggedIn,isTeacher,task.taskForm);


//task post
router.post("/task",isLoggedIn,isTeacher,wrapAsync(task.taskSubmit));


//task edit
router.get("/task/:id/editForm",wrapAsync(task.taskEditForm));


//task update
router.put("/task/:id",wrapAsync(task.taskUpdate));


//task delete
router.delete("/task/:id",wrapAsync(task.taskDelete));


module.exports = router;