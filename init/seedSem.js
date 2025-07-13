const mongoose = require("mongoose");
const initData = require("./semData");
const Listing = require("../models/subject.js");

const mongoLink = "mongodb://127.0.0.1:27017/QBProject";

main()
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(mongoLink);
}

const initDB = async () => {
    await  Listing.deleteMany({});
    await Listing.insertMany(initData);
    console.log("data was initialized");
    mongoose.connection.close();
}

initDB();