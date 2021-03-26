const express = require("express");
const router = express.Router({ mergeParams: true });

//Require campground model
const Campground = require("../models/campground");
//Require review model
const Review = require("../models/review");

//Require Error middleware
const wrapAysnc = require("../utils/wrapAysnc");
const ExpressError = require("../utils/ExpressError");

//Require campground and review schema JOI
const { reviewSchema } = require("../schemas");

//Validate review inputs using JOi
const validateReview = (req, res, next) => {
   const { error } = reviewSchema.validate(req.body);
   if (error) {
      const msg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(msg, 400);
   } else {
      next();
   }
};

//Review Routes
router.post(
   "/",
   validateReview,
   wrapAysnc(async (req, res) => {
      const campground = await Campground.findById(req.params.id);
      const review = new Review(req.body.review);
      campground.reviews.push(review);
      await review.save();
      await campground.save();
      req.flash("success", "Created new review");
      res.redirect(`/campgrounds/${campground._id}`);
   })
);

//Delete campground review route
router.delete(
   "/:reviewId",
   wrapAysnc(async (req, res) => {
      const { id, reviewId } = req.params;
      await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
      await Review.findByIdAndDelete(reviewId);
      req.flash("success", "Successfully deleted review");
      res.redirect(`/campgrounds/${id}`);
   })
);

module.exports = router;
