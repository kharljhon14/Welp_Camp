//Get Express js
const express = require("express");
const app = express();
//Get Mongoose
const mongoose = require("mongoose");
//Get path directory
const path = require("path");
//Require campground model
const Campground = require("./models/campground");
//Require method override
const methodOverride = require("method-override");
//Require morgan
const morgan = require("morgan");
//Require EJS mate
const ejsEngine = require("ejs-mate");

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

//Home GET route
app.get("/", (req, res) => {
   res.render("home");
});

//Camgrounds GET route
app.get("/campgrounds", async (req, res) => {
   //find all campgrounds in Campground model
   const campgrounds = await Campground.find({});
   res.render("campgrounds/index", { campgrounds });
});

//New campground route
app.get("/campgrounds/new", (req, res) => {
   res.render("campgrounds/new");
});

//New campground POST route
app.post("/campgrounds", async (req, res) => {
   const campground = new Campground(req.body.campground);
   await campground.save();
   res.redirect(`/campgrounds/${campground._id}`);
});

//Campground show route
app.get("/campgrounds/:id", async (req, res) => {
   //Deconstruct id form request
   const { id } = req.params;
   //Find campground with the same id
   const campground = await Campground.findById(id);
   res.render("campgrounds/show", { campground });
});

//Edit campground route
app.get("/campgrounds/:id/edit", async (req, res) => {
   const campground = await Campground.findById(req.params.id);
   res.render("campgrounds/edit", { campground });
});

//Update campground put request
app.put("/campgrounds/:id", async (req, res) => {
   const { id } = req.params;
   // Spread campground data
   const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
   });
   res.redirect(`/campgrounds/${campground._id}`);
});

//Delete campground request
app.delete("/campgrounds/:id", async (req, res) => {
   const { id } = req.params;
   const campground = await Campground.findByIdAndDelete(id);
   res.redirect("/campgrounds");
});

//Port for express to listen
const PORT = process.env.PORT || 3000;
//Listen for port
app.listen(PORT, () => {
   console.log("Listening for port " + PORT);
});
