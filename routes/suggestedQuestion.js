const express = require('express');
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");

const Question = require("../models/newQues");

const suggestedQuestion = require("../controllers/suggestedQuestion.js")


//Middleware
//isQuestionOwner
const isQuestionOwner = async (req,res,next)=>{
  let {id} = req.params;
  let question = await Question.findById(id);
  if (!question.username.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of the listings");
    return res.redirect("/semester/newQuePage");
  }
  next();
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



//display suggested question page
router.get("/newQuePage",wrapAsync(suggestedQuestion.suggQuesPage));


//Suggession Question form
router.get("/newQues",isLoggedIn,suggestedQuestion.suggQuesForm );


//suggestion question post
router.post("/newQues",wrapAsync(suggestedQuestion.suggestQues));


//suggested question edit get request
router.get("/newQues/:id/edit",isQuestionOwner,isLoggedIn,wrapAsync(suggestedQuestion.suggQuesEditForm));


//suggested question edit PUT request
router.put("/newQues/:id",isQuestionOwner,wrapAsync(suggestedQuestion.suggQuesEdit));


//suggested question delete || delete request

router.delete("/newQues/:id",isQuestionOwner,wrapAsync(suggestedQuestion.suggQuesDelete));


module.exports = router;