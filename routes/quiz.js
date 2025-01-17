var express = require("express");
var router = express.Router();
const fs = require("fs");
const questionsFileName = "./questions/questions.json";

function readQuestionsDB() {
  let data = fs.readFileSync(questionsFileName, "utf-8");
  return JSON.parse(data);
}

function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex],
    ];
  }
}

router.get("/", function (req, res, next) {
  let questionsList = readQuestionsDB();
  shuffle(questionsList);
  let questions = questionsList.splice(0, 10);
  res.render("quiz", { questions: questions });
});

module.exports = router;
