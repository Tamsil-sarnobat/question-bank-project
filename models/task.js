const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema ({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    semester:{
        type:String,
        required:true,
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }

})


module.exports = mongoose.model("Task",taskSchema);