const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");

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




app.get("/",(req,res)=>{
    res.send("Working On The Root!");
})

app.listen(8080,()=>{
    console.log("listening on the port 8080");
});