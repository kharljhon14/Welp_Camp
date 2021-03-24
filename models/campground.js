const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const CampgroundSchema = new Schema({
   title: String,
   img: String,
   price: Number,
   description: String,
   location: String,
   reviews: [
      {
         type: Schema.Types.ObjectId,
         ref: "Review",
      },
   ],
});

CampgroundSchema.post("findOneAndDelete", async function (campground) {
   if (campground) {
      await Review.deleteMany({
         _id: {
            $in: campground.reviews,
         },
      });
   }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
