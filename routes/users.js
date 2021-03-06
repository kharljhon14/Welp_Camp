const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAysnc");

const User = require("../models/user");
const passport = require("passport");

router.get("/register", (req, res) => {
   res.render("users/register");
});

router.post(
   "/register",
   wrapAsync(async (req, res) => {
      try {
         const { email, username, password } = req.body;
         const user = new User({ email, username });
         const resgisteredUser = await User.register(user, password);
         req.flash("success", "Welcome User");
         req.login(resgisteredUser, (err) => {
            if (err) {
               return next(err);
            }
         });
         res.redirect("/campgrounds");
      } catch (err) {
         req.flash("error", err.message);
         res.redirect("/register");
      }
   })
);

router.get("/login", (req, res) => {
   res.render("users/login");
});

router.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), (req, res) => {
   req.flash("success", "Welcome Back!");
   const redirectUrl =  req.session.returnTo || "/campgrounds"; 
   delete req.session.returnTo;
   res.redirect(redirectUrl);
});

router.get("/logout", (req, res) => {
   req.logout();
   req.flash("success", "Bye!");
   res.redirect("/");
});

module.exports = router;
