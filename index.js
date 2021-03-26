//Get Express js
const express = require("express");
const app = express();
//Get Mongoose
const mongoose = require("mongoose");
//Get Express session
const session = require("express-session");
//Get connect flash
const flash = require("connect-flash");
//Get path directory
const path = require("path");
//Require method override
const methodOverride = require("method-override");
//Require morgan
const morgan = require("morgan");
//Require EJS mate
const ejsEngine = require("ejs-mate");
//Require campground and review schema JOI
const { campgroundSchema, reviewSchema } = require("./schemas");

//Routes
const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");

//Connect to mongodb
mongoose.connect("mongodb://localhost:27017/Welp-Camp", {
   useNewUrlParser: true,
   useCreateIndex: true,
   useUnifiedTopology: true,
   useFindAndModify: false,
});

//Check for mongo errors
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
   console.log("Database connected");
});

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
//Set public directory
app.use(express.static(path.join(__dirname, "public")));

//express session
const sessionConfig = {
   secret: "secret",
   resave: false,
   saveUninitialized: true,
   cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
   },
};

app.use(session(sessionConfig));
//Flash
app.use(flash());

app.use((req, res, next) => {
   res.locals.success = req.flash("success");
   res.locals.error = req.flash("error");
   next();
});

//express Routers
app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);

//Home GET route
app.get("/", (req, res) => {
   res.render("home");
});

//General error middleware 404
app.all("*", (req, res, next) => {
   next(new ExpressError("Page Not Found", 404));
});

//Specific error middleware
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
