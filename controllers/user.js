const User = require("../models/users");
const {userSchema} = require("../schema.js");


//Sign-in route get
module.exports.signInForm = (req,res)=>{
  res.render("users/signinForm");
}

//Sign-in route post
module.exports.signInUser = async (req,res)=>{
  try{
      let {username,email,password,role,semester} = req.body;
      let newUser = new User({
         username:username,
         email:email,
         role:role,
         semester:semester
     })
  let user = await User.register(newUser,password);
  req.login(user,(err)=>{
    if(err){
      return next(err);
    }
    req.flash("success","You Successfully sign-In, Welcome To Regal College!");
    res.redirect("/");
  })
  
  }catch(e){
    req.flash("error",e.message);
    res.redirect("/semester/signin");
  }

}


//login route get
module.exports.loginUserForm = (req,res)=>{
  res.render("users/loginForm")
}

//login route post
module.exports.loginUser = async (req,res)=>{
  req.flash("success","Welcome Back to regal College");
  let redirectUrl = res.locals.redirectUrl || "/";
  console.log(redirectUrl);
  res.redirect(redirectUrl);
}

//logout
module.exports.logoutUser = (req,res)=>{
  req.logOut((err)=>{
    if(err){
      return next(err);
    }
    req.flash("success","You Logged Out!");
    res.redirect("/");
  });
}
