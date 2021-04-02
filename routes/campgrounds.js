const express = require("express");
const router = express.Router();

const wrapAysnc = require("../utils/wrapAysnc");
const ExpressError = require("../utils/ExpressError");

const Campground = require("../models/campground");
//Check if logged in middle ware
const { isLoggedIn } = require("../middleware");

//Require campground and review schema JOI
const { campgroundSchema } = require("../schemas");

//Validate inputs using JOI
const validateCampground = (req, res, next) => {
   //campground schema for validation using JOI
   const { error } = campgroundSchema.validate(req.body);
   if (error) {
      //Map key value pairs of element message // combine them together
      const msg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(msg, 400);
   } else {
      next();
   }
};

//Camgrounds GET route
router.get(
   "/",
   wrapAysnc(async (req, res) => {
      //find all campgrounds in Campground model
      const campgrounds = await Campground.find({});
      res.render("campgrounds/index", { campgrounds });
   })
);

//New campground route
router.get("/new", isLoggedIn, (req, res) => {
   res.render("campgrounds/new");
});

//New campground POST route
router.post(
   "/",
   isLoggedIn,
   validateCampground,
   wrapAysnc(async (req, res) => {
      const campground = new Campground(req.body.campground);
      campground.author = req.user._id;
      await campground.save();
      req.flash("success", "Successfully made a new campground");
      res.redirect(`/campgrounds/${campground._id}`);
   })
);

//Campground show route
router.get(
   "/:id",
   wrapAysnc(async (req, res) => {
      //Deconstruct id form request
      const { id } = req.params;
      //Find campground with the same id
      const campground = await Campground.findById(id).populate("reviews").populate("author");
      if (!campground) {
         req.flash("error", "Cannot find that campground");
         return res.redirect("/campgrounds");
      }
      res.render("campgrounds/show", { campground });
   })
);

//Edit campground route
router.get(
   "/:id/edit",
   isLoggedIn,
   wrapAysnc(async (req, res) => {
      const campground = await Campground.findById(req.params.id);
      if (!campground) {
         req.flash("error", "Cannot find that campground");
         return res.redirect("/campgrounds");
      }
      res.render("campgrounds/edit", { campground });
   })
);

//Update campground put request
router.put(
   "/:id",
   isLoggedIn,
   validateCampground,
   wrapAysnc(async (req, res) => {
      const { id } = req.params;
      // Spread campground data
      const campground = await Campground.findByIdAndUpdate(id, {
         ...req.body.campground,
      });
      req.flash("success", "Successfully updated campground");
      res.redirect(`/campgrounds/${campground._id}`);
   })
);

//Delete campground request
router.delete(
   "/:id",
   isLoggedIn,
   wrapAysnc(async (req, res) => {
      const { id } = req.params;
      const campground = await Campground.findByIdAndDelete(id);
      req.flash("success", "Successfully deleted campground");
      res.redirect("/campgrounds");
   })
);

module.exports = router;
