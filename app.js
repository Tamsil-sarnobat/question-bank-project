const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const {userSchema, feedbackSchema} = require("./schema.js");
const wrapAsync = require("./utils/wrapAsync.js");
const Subject = require("./models/subject.js");
const Feedback = require("./models/feedback.js");
const session = require("express-session");
const passport = require("passport");
const  localStrategy = require("passport-local");
const User = require("./models/users");
const flash = require("connect-flash");
const Question = require("./models/newQues.js");

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
app.use(express.json());
app.use(methodOverride('_method'))
app.use(session(sessionOption));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




//Validate user
const validateUser = (req,res,next)=>{
  let {error} = userSchema.validate(req.body);
  if(error){
    throw new ExpressError(404,error.details[0].message);
  }else{
    next();
  }
};

//feedback validate middleware fn
const validateFeedback = (req,res,next) => {
  console.log(req.body);
  const {error} = feedbackSchema.validate(req.body);
  if(error) {
    throw new ExpressError(404, error.details[0].message);
  }
  next();
};



//flash message
app.use((req,res,next)=>{
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.currUser = req.user;
  next();
});



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

// route saving redirect middleware
const saveReturnTo = (req,res,next)=>{
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
}




///homepage
app.get("/", async (req, res) => {
  const topFeedbacks = await Feedback.find({})
  .sort({createdAt: -1})
  .limit(3)
  .populate("user");

  res.render("semesters/home", { topFeedbacks });
});



//display suggested question page
app.get("/semester/newQuePage",wrapAsync(async (req,res)=>{
  const question = await  Question.find({}).populate("username");
  res.render("suggestedQuestion/suggestedQuesPage",{question});
}))

//Suggession Question form
app.get("/semester/newQues",isLoggedIn,(req,res)=>{
    res.render("suggestedQuestion/suggQuesForm");
})

//suggestion question post
app.post("/semester/newQues",wrapAsync(async (req,res)=>{
  let {subject,question} = req.body;

  let newQuestion = new Question({
    username:req.user._id,
    subject:subject,
    question:question
  });
  let ques = await newQuestion.save();
  console.log(ques);
  console.log(ques._id);
  req.flash("success","You have contributed");
  res.redirect("/semester/newQuePage");
}))

//suggested question edit get request

app.get("/semester/newQues/:id/edit",isLoggedIn,wrapAsync(async (req,res)=>{
  let {id} = req.params;
  const question = await  Question.findById(id).populate("username");
  res.render("suggestedQuestion/suggQuesEdit",{question});
}))


//suggested question edit PUT request

app.put("/semester/newQues/:id",wrapAsync(async (req,res)=>{
  let {id} = req.params;
  let {subject,question}= req.body;
  console.log(id);
  const newQuestion = await  Question.findByIdAndUpdate(
    id,
    {subject,question},{runValidators:true,new:true}
  );
  console.log(newQuestion);
 res.redirect("/semester/newQuePage");
}))

//suggested question edit PUT request

app.delete("/semester/newQues/:id",wrapAsync(async(req,res)=>{
  let {id} = req.params;
  let deletedQues = await Question.findByIdAndDelete(id);
  console.log(deletedQues);
  res.redirect("/semester/newQuePage");
}))



//Sign-in route get/post
app.get("/semester/signin",(req,res)=>{
  res.render("users/signinForm");
})

//post
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

}));


//login route get/post
app.get("/semester/login",(req,res)=>{
  res.render("users/loginForm")
})


app.post("/semester/login",saveReturnTo,passport.authenticate("local",{
  failureRedirect:"/semester/login",
  failureFlash:true,
}),wrapAsync(async (req,res)=>{
  req.flash("success","Welcome Back to regal College");
  let redirectUrl = res.locals.redirectUrl || "/";
  console.log(redirectUrl);
  res.redirect(redirectUrl);
}))


app.get("/logout",(req,res)=>{
  req.logOut((err)=>{
    if(err){
      return next(err);
    }
    req.flash("success","You Logged Out!");
    res.redirect("/");
  });
});

//Semester 
app.get("/semesters/:id", wrapAsync(async(req, res) => {
  const semId = parseInt(req.params.id);
  const Subjects = await Subject.find({semester: semId});
  res.render("semesters/semester",{ semId, Subjects });
}));



//feedback form routes
app.get("/feedback", isLoggedIn, (req,res) => {
  res.render("feedback/feedback.ejs");
});

app.post("/feedback", isLoggedIn , wrapAsync(async (req,res) => {
  const feedback = new Feedback(req.body);
  feedback.user = req.user._id;
  await feedback.save();

  const user = await User.findById(req.user._id);
  user.feedbacks.push(feedback._id);
  await user.save();

  req.flash("success", "Feedback submitted successfully!");
  res.render("feedback/thankyou");
}));


//feedback page route
app.get("/feedbacks", async (req,res) => {
  const allFeedbacks = await Feedback.find({})
  .sort({ createdAt: -1})
  .populate("user");

  res.render("feedback/feedbackpage.ejs", {allFeedbacks});
});

//feedback delete route
app.delete("/feedbacks/:id", async (req, res) => {
  const { id } = req.params;
  const feedback = await Feedback.findById(id);

  if (!feedback) {
    req.flash("error", "Feedback not found");
    return res.redirect("/feedbacks");
  }

  // Optional: Only allow owner to delete
  // if (!feedback.user.equals(req.user._id)) {
  //   req.flash("error", "You do not have permission to delete this feedback");
  //   return res.redirect("/feedbacks");
  // }

  await Feedback.findByIdAndDelete(id);
  req.flash("success", "Feedback deleted successfully");
  res.redirect("/feedbacks");
});


//page  not found
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

