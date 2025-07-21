const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique: true
    },
    role: {
       type: String,
       enum: ["student", "teacher"],
       required: true,
    },
    semester:{
        type:String,
        required:true,
    }

})

userSchema.plugin(passportLocalMongoose);

module.exports =  mongoose.model("User",userSchema);