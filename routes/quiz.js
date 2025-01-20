var express = require("express");
var router = express.Router();
const fs = require("fs");
const questionsFileName = "./questions/questions.json";
let questions;
let correct = 0;

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
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

router.get("/", function (req, res, next) {
  correct = 0;
  console.log(correct);
  let questionsList = readQuestionsDB();
  shuffle(questionsList);
  questions = questionsList.splice(0, 10);
  res.render("quiz", { questions: questions });
});

router.get("/results", function (req, res, next) {
  res.render("results", { correct: correct, });
  console.log(correct);
});

router.post("/results", (req, res) => {
  let answeredQuestions = JSON.parse(JSON.stringify(req.body));
  let submittedAnswers = [];
  submittedAnswers.push(...Object.values(answeredQuestions));
  for (let i = 0; i < questions.length; i++) {
    if (submittedAnswers[i] === questions[i].answer) {
      correct++;
    }
  }
  res.redirect("/quiz/results");
});

module.exports = router;
