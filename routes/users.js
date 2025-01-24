var express = require("express");
var router = express.Router();
const fs = require("fs");
const userDBFileName = "./models/user.json";
const { getCollection } = require("../models/db");
let name = "";
let scores = [];
let highScore;

function writeUserDB(users) {
  let data = JSON.stringify(users, null, 2);
  fs.writeFileSync(userDBFileName, data, "utf-8");
}
function readUserDB() {
  let data = fs.readFileSync(userDBFileName, "utf-8");
  return JSON.parse(data);
}

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

router.get("/profile", async function (req, res, next) {
  const userEmail = readUserDB();
  const usersCollection = getCollection("users");
  const query = { email: userEmail };
  const result = await usersCollection.findOne(query);
  res.render("profile", { name: result.name, scores: result.scores, highScore: result.highScore });
});

router.post("/signup/submit", async (req, res) => {
  const usersCollection = getCollection("users");
  const newUser = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    scores: [],
    highScore: 0,
  };

  userEmail = req.body.email;
  const query = { email: req.body.email };
  const result = await usersCollection.findOne(query);

  if (result != null) {
    res.redirect("/users/signup");
  }
  if (result === null) {
    try {
      await usersCollection.insertOne(newUser);
      res.redirect("/users/signin");
    } catch (e) {
      res.status(500).send("Failed to save to db.");
    }
  }
});

router.post("/signin/submit", async (req, res) => {
  const usersCollection = getCollection("users");
  const query = { email: req.body.email };

  const result = await usersCollection.findOne(query);
  if (result != null) {
    if (result.password === req.body.password) {
      writeUserDB(JSON.parse(JSON.stringify(result.email)));
      name = result.name;
      scores = result.scores;
      highScore = result.highScore;
      res.redirect("/users/profile");
    }
    if (result.password != req.body.password) {
      res.redirect("/users/signin");
    }
  }
  if (result === null) {
    res.redirect("/users/signin");
  }
});

module.exports = router;
