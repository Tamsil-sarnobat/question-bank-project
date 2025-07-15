const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const User = require("./models/users");
const ExpressError = require("./utils/ExpressError");
const userSchema = require("./schema.js");
const wrapAsync = require("./utils/wrapAsync.js");


const mongoLink = "mongodb://127.0.0.1:27017/QBProject";


main()
.then(()=>{
   console.log("Connected to database");
})
.catch(err => console.log(err));


async function main() {
  await mongoose.connect(mongoLink);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended:true}));
app.engine("ejs",ejsMate);



app.get("/verify",(req,res)=>{
  res.send(req.signedCookies);
});

const validateUser = (err,req,res,next)=>{
  let {error} = userSchema.validate(req.body);
  if(error){
    throw new ExpressError(404,error.details[0].message);
  }else{
    next(err);
  }
};


app.get("/", (req, res) => {
  res.render("semesters/home");
});


app.get("/semester/login",(req,res)=>{
  res.render("users/loginForm")
})

app.get("/semester/signin",(req,res)=>{
  res.render("users/signinForm");
})

app.post("/semester/signin",validateUser,wrapAsync(async (req,res)=>{
  let {username,email,password,role,semester} = req.body;
  let newUser = new User({
    username:username,
    email:email,
    password:password,
    role:role,
    semester:semester
  })

  await newUser.save();
  res.redirect("/");
}));




app.use((err,req,res,next)=>{
  let {status=500,message="something went wrong"} = err;
  res.status(status).send(message);
});


app.listen(8080,()=>{
    console.log("listening on the port 8080");
});



// let insertData = async ()=>{
//   let user = new User({
//     username:"demo ",
//     email:"demo@gmail.com",
//     password:"demo12",
//     role:"student",
//     semester:"sem1"
//   })

//   await user.save();
// }
// insertData();
