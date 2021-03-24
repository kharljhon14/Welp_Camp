const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
   body: String,
   rating: Number,
});

//Export Review model
module.exports = mongoose.model("Review", reviewSchema);

