const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique: true
    },
    password:{
        type:String,
        required:true
    },
    role: {
       type: String,
       enum: ["student", "teacher"],
       required: true,
    },
    semester:{
        type:String,
        required:true,
    },

    feedbacks: [
    {
      type: Schema.Types.ObjectId,
      ref: "Feedback"
    }
  ]

});

module.exports =  mongoose.model("User",userSchema);