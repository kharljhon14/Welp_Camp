const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
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

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDb = async () => {
   await Campground.deleteMany({});
   for (let i = 0; i < 50; i++) {
      const randNum = Math.floor(Math.random() * cities.length);
      const price = Math.floor(Math.random() * 20) + 10;
      const camp = new Campground({
         author: "6062779252c454120499d402",
         location: `${cities[randNum].city}, ${cities[randNum].state}`,
         title: `${sample(descriptors)} ${sample(places)}`,
         img: "https://source.unsplash.com/collection/483251",
         description:
            "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iste culpa doloribus tempora officia quasi quae accusamus perspiciatis, temporibus pariatur, reiciendis maiores. Eligendi suscipit nam mollitia optio dolorum ea quam",
         price: price,
      });
      await camp.save();
   }
};

seedDb().then(() => {
   mongoose.connection.close();
});
