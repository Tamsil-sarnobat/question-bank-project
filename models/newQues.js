const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const newQuesSchema = new Schema({
    username:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },

    question:{
        type:String,
        required:true
    },

    subject:{
        type:String,
        required:true
    },

    createdAt:{
        type:Date,
        default:Date.now
    }

})

module.exports = mongoose.model("Question",newQuesSchema);