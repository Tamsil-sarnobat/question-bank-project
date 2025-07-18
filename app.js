const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const {userSchema} = require("./schema.js");
const wrapAsync = require("./utils/wrapAsync.js");
const Subject = require("./models/subject.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const  localStrategy = require("passport-local");
const User = require("./models/users");
const flash = require("connect-flash");

const mongoLink = "mongodb://127.0.0.1:27017/QBProject";

main()
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(mongoLink);
}

let sessionOption ={
  secret:"mySecretCookies",
  resave:false,
  saveUninitialized:true,
  cookie:{
      expires:Date.now()+ 7*24*60*60*1000,
      maxAge:7*24*60*60*1000,
      httpOnly:true,
  }
}


app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("mySecretCookie"));
app.use(session(sessionOption));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





const validateUser = (req,res,next)=>{
  let {error} = userSchema.validate(req.body);
  if(error){
    throw new ExpressError(404,error.details[0].message);
  }else{
    next();
  }
};

//flash message
app.use((req,res,next)=>{
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.get("/", (req, res) => {
  res.render("semesters/home");
});


//Sign-in route get/post
app.get("/semester/signin",(req,res)=>{
  res.render("users/signinForm");
})

app.post("/semester/signin",validateUser,wrapAsync(async (req,res)=>{
  try{
      let {username,email,password,role,semester} = req.body;
      let newUser = new User({
         username:username,
         email:email,
         role:role,
         semester:semester
     })
  let user = await User.register(newUser,password);
  req.flash("success","You Successfully sign-In, Welcome To Regal College!");
  res.redirect("/");
  }catch(e){
    req.flash("error",e.message);
    res.redirect("/semester/signin");
  }

}));


//login route get/post
app.get("/semester/login",(req,res)=>{
  res.render("users/loginForm")
})


app.post("/semester/login",passport.authenticate("local",{
  failureRedirect:"/semester/login",
  failureFlash:true,
}),wrapAsync(async (req,res)=>{
   req.flash("success","welcom Back to regal College");
   return res.redirect("/");
}))


app.get("/semesters/:id", async(req, res) => {
  const semId = parseInt(req.params.id);
  const Subjects = await Subject.find({semester: semId});
  res.render("semesters/semester",{ semId, Subjects });
});


app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});


app.use((err,req,res,next)=>{
  let {status=500,message="something went wrong"} = err;
  res.status(status).render("semesters/error",{message});
});


app.listen(8080, () => {
  console.log("listening on the port 8080");
});

