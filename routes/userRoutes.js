const express = require('express');
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const user = require("../controllers/user.js");

const wrapAsync = require("../utils/wrapAsync.js");
const User = require("../models/users");
const {userSchema} = require("../schema.js");


//Validate user
const validateUser = (req,res,next)=>{
  let {error} = userSchema.validate(req.body);
  if(error){
    throw new ExpressError(404,error.details[0].message);
  }else{
    next();
  }
};


// route saving redirect middleware
const saveReturnTo = (req,res,next)=>{
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
}



//Sign-in route get/post
router.get("/signin",user.signInForm);

//post
router.post("/signin",validateUser,wrapAsync(user.signInUser));


//login route get/post
router.get("/login",user.loginUserForm);



router.post("/login",saveReturnTo,passport.authenticate("local",{
  failureRedirect:"/semester/login",
  failureFlash:true,
}),wrapAsync(user.loginUser));

//logout
router.get("/logout",user.logoutUser);



module.exports = router;