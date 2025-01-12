const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const passport = require("passport");

// Login Page
router.get("/login", (req, res) => res.render("login"));

// Register Page
router.get("/register", (req, res) => res.render("register"));

// Register Handle
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];
  let success_msg  = '';
  let error_msg = '';

  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  // Check password length
  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }


  if (errors.length > 0) {
    res.render("register", {
      errors,
      success_msg,
      error_msg,
      name,
      email,
      password,
      password2,
    });
  } else {
    // Validation passed
    User.findOne({ email: email }).then((user) => {
      if (user) {
        // User exists
        errors.push({ msg: "User already exists" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });
        // Hash Password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            // Set password to hashed
            newUser.password = hash;
            // Save user
            newUser
              .save()
              .then((user) => {
                req.flash("success_msg", "You are now registered and can log in");
                res.render ("login" ,{
                  success_msg,
                  error_msg,
                });
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});

// Login Handle
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout Handle
router.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err); // Passes errors to the error handler
    }
    req.flash("success_msg", "You are logged out");
    res.redirect("/users/login");
  });
});


module.exports = router;
