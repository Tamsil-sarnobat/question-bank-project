if(process.env.NODE_ENV != "production") {
  require('dotenv').config();
}

const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const wrapAsync = require("./utils/wrapAsync.js");
const Subject = require("./models/subject.js");
const Feedback = require("./models/feedback.js");
const session = require("express-session");
const passport = require("passport");
const  localStrategy = require("passport-local");
const User = require("./models/users");
const flash = require("connect-flash");

//ROUTES
const questionPaperRoutes = require("./routes/questionPapers.js");
const suggestedQuestion = require('./routes/suggestedQuestion.js');
const taskRoutes = require("./routes/taskRoutes.js");
const feedbackRoutes = require("./routes/feedbackRoutes.js");
const subjectRoutes = require("./routes/subjectRoutes.js");
const userRoutes = require("./routes/userRoutes.js");

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
app.use(methodOverride('_method'));
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



//flash message
app.use((req, res, next) => {
  res.locals.currUser = req.user;

  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.teacher = req.user &&  req.user.role ===  "teacher";
  next();
});





///homepage
app.get("/", async (req, res) => {
  const topFeedbacks = await Feedback.find({})
  .sort({createdAt: -1})
  .limit(3)
  .populate("user");

  res.render("semesters/home", { topFeedbacks });
});


///Semester 
app.get("/semesters/:id", wrapAsync(async(req, res) => {
  const semId = parseInt(req.params.id);
  const Subjects = await Subject.find({semester: semId});
  res.render("semesters/semester",{ semId, Subjects });
}));



//Question Paper Routes
app.use("/", questionPaperRoutes);

//Suggested Question Routes
app.use("/semester",suggestedQuestion);

//Task Routes
app.use("/semester",taskRoutes);

//feedback Routes
app.use("/feedback", feedbackRoutes);

//subject Routes
app.use("/semesters/:id/subjects",subjectRoutes);

//User Routes
app.use("/semester",userRoutes);




//page  not found
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});


app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("semesters/error", { message });
});


app.listen(8080, () => {
  console.log("listening on the port 8080");
});

