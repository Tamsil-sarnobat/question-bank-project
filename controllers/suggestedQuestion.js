const Question = require("../models/newQues");


//display suggested question page
module.exports.suggQuesPage = async (req,res)=>{
  const question = await  Question.find({}).populate("username");
  res.render("suggestedQuestion/suggestedQuesPage.ejs",{question});
} 

//Suggession Question form
module.exports.suggQuesForm = (req,res)=>{
    res.render("suggestedQuestion/suggQuesForm.ejs");
}

//suggestion question post
module.exports.suggestQues = async (req,res)=>{
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
}


//suggested question edit get request
module.exports.suggQuesEditForm = async (req,res)=>{
  let {id} = req.params;
  const question = await  Question.findById(id).populate("username");
  res.render("suggestedQuestion/suggQuesEdit.ejs",{question});
}


//suggested question edit PUT request
module.exports.suggQuesEdit = async (req,res)=>{
  let {id} = req.params;
  let {subject,question}= req.body;
  console.log(id);
  const newQuestion = await  Question.findByIdAndUpdate(
    id,
    {subject,question},{runValidators:true,new:true}
  );
  console.log(newQuestion);
 res.redirect("/semester/newQuePage");
}


//suggested question delete || delete request
module.exports.suggQuesDelete = async(req,res)=>{
  let {id} = req.params;
  let deletedQues = await Question.findByIdAndDelete(id);
  console.log(deletedQues);
  res.redirect("/semester/newQuePage");
}