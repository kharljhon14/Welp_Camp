//Get Express js
const express = require("express");
const app = express();
//Get Mongoose
const mongoose = require("mongoose");
//Get path directory
const path = require("path");
//Require campground model
const Campground = require("./models/campground");
//Require review model
const Review = require("./models/review");
//Require method override
const methodOverride = require("method-override");
//Require morgan
const morgan = require("morgan");
//Require Error middleware
const wrapAysnc = require("./utils/wrapAysnc");
const ExpressError = require("./utils/ExpressError");
//Require EJS mate
const ejsEngine = require("ejs-mate");
//Require campground and review schema JOI
const { campgroundSchema, reviewSchema } = require("./schemas");

//Use express parser
app.use(express.urlencoded({ extended: true }));
//Use method override
app.use(methodOverride("_method"));
//Use morgan
app.use(morgan("common"));

//Use EJS mate engine
app.engine("ejs", ejsEngine);

//Set EJS
app.set("view engine", "ejs");
//Set views directory
app.set("views", path.join(__dirname, "views"));

//Connect to mongodb
mongoose.connect("mongodb://localhost:27017/Welp-Camp", {
   useNewUrlParser: true,
   useUnifiedTopology: true,
});

//Check for mongo errors
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
   console.log("Database connected");
});

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

//Home GET route
app.get("/", (req, res) => {
   res.render("home");
});

//Camgrounds GET route
app.get(
   "/campgrounds",
   wrapAysnc(async (req, res) => {
      //find all campgrounds in Campground model
      const campgrounds = await Campground.find({});
      res.render("campgrounds/index", { campgrounds });
   })
);

//New campground route
app.get("/campgrounds/new", (req, res) => {
   res.render("campgrounds/new");
});

//New campground POST route
app.post(
   "/campgrounds",
   validateCampground,
   wrapAysnc(async (req, res) => {
      const campground = new Campground(req.body.campground);
      await campground.save();
      res.redirect(`/campgrounds/${campground._id}`);
   })
);

//Campground show route
app.get(
   "/campgrounds/:id",
   wrapAysnc(async (req, res) => {
      //Deconstruct id form request
      const { id } = req.params;
      //Find campground with the same id
      const campground = await Campground.findById(id).populate("reviews");
      res.render("campgrounds/show", { campground });
   })
);

//Edit campground route
app.get(
   "/campgrounds/:id/edit",
   wrapAysnc(async (req, res) => {
      const campground = await Campground.findById(req.params.id);
      res.render("campgrounds/edit", { campground });
   })
);

//Update campground put request
app.put(
   "/campgrounds/:id",
   validateCampground,
   wrapAysnc(async (req, res) => {
      const { id } = req.params;
      // Spread campground data
      const campground = await Campground.findByIdAndUpdate(id, {
         ...req.body.campground,
      });
      res.redirect(`/campgrounds/${campground._id}`);
   })
);

//Review Routes
app.post(
   "/campgrounds/:id/reviews",
   validateReview,
   wrapAysnc(async (req, res) => {
      const campground = await Campground.findById(req.params.id);
      const review = new Review(req.body.review);
      campground.reviews.push(review);
      await review.save();
      await campground.save();
      res.redirect(`/campgrounds/${campground._id}`);
   })
);

//Delete campground review route
app.delete(
   "/campgrounds/:id/reviews/:reviewId",
   wrapAysnc(async (req, res) => {
      const { id, reviewId } = req.params;
      await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
      await Review.findByIdAndDelete(reviewId);
      res.redirect(`/campgrounds/${id}`);
   })
);

//Delete campground request
app.delete(
   "/campgrounds/:id",
   wrapAysnc(async (req, res) => {
      const { id } = req.params;
      const campground = await Campground.findByIdAndDelete(id);
      res.redirect("/campgrounds");
   })
);

app.all("*", (req, res, next) => {
   next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
   const { status = 500 } = err;
   if (!err.message) err.message = "Oh No, Something Went Wrong!";
   res.status(status).render("error", { err });
});

//Port for express to listen
const PORT = process.env.PORT || 3000;
//Listen for port
app.listen(PORT, () => {
   console.log("Listening for port " + PORT);
});
