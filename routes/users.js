const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAysnc");

const User = require("../models/user");

router.get("/register", (req, res) => {
   res.render("users/register");
});

router.post("/register",wrapAsync(async (req, res) => {
      try {
         const { email, username, password } = req.body;
         const user = new User({ email, username });
         const resgisteredUser = await User.register(user, password);
         req.flash("success", "Welcome User");
         res.redirect("/campgrounds");
      } catch (err) {
         req.flash("error", err.message);
         res.redirect("/register");
      }
    })
);

module.exports = router;
