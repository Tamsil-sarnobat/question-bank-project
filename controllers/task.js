const Task = require("../models/task.js");


//tasks page
module.exports.taskPage =async (req,res)=>{
  const task = await Task.find({}).populate("createdBy")
  res.render("Tasks/taskPage.ejs",{task});
}

//task Form
module.exports.taskForm = (req,res)=>{
  res.render("Tasks/taskForm.ejs");
}

//task post
module.exports.taskSubmit = async (req,res)=>{
  let {title,description,semester} = req.body;
  let createdBy = req.user._id;
  let newTask = new Task({
    title:title,
    description:description,
    semester:semester,
    createdBy:createdBy
  });
  let currTask = await newTask.save();
  console.log(currTask);
  res.redirect("/semester/taskPage");
}


//task edit
module.exports.taskEditForm = async (req,res)=>{
  let {id} = req.params;
  let task = await Task.findById(id).populate("createdBy");
  res.render("Tasks/taskEditForm.ejs",{task});
}


//task update
module.exports.taskUpdate = async (req,res)=>{
      let {id} = req.params;
      let { title, description, semester} = req.body;

      let newTask = await Task.findByIdAndUpdate(
        id,
        {title,description,semester},
        {runValidators:true,new:true}
      )
      console.log(newTask);
      res.redirect("/semester/taskPage");
}


//task delete
module.exports.taskDelete = async (req,res)=>{
  let {id} = req.params;
  let deletedTask = await Task.findByIdAndDelete(id);
  console.log(deletedTask);
  res.redirect("/semester/taskPage");
}