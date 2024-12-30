const express = require("express");
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");

// Welcome Page
router.get("/", (req, res) => res.render("Welcome"));

// Dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  const user = req.user;
  res.render("dashboard", {
    user,
  });
});


module.exports = router;