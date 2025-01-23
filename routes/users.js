var express = require("express");
var router = express.Router();
const { getCollection } = require("../models/db");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/signup", function (req, res, next) {
  res.render("signup");
});

router.get("/signin", function (req, res, next) {
  res.render("signin");
});

router.post("/signup/submit", async (req, res) => {
  const usersCollection = getCollection("users");
  try {
    await usersCollection.insertOne(req.body);
    res.redirect("/users/signin");
  } catch (e) {
    res.status(500).send("Failed to save to db.");
  }
});

router.post("/signin/submit", async (req, res) => {
  const usersCollection = getCollection("users");
  const query = { email: req.body.email };

  const result = await usersCollection.findOne(query);
  if(result.password === req.body.password) {
    console.log("success!");
  }
  if(result.password != req.body.password) {
    console.log("failed to sign in.");
  }
});

module.exports = router;
