var express = require("express");
var router = express.Router();
var axios = require("axios");
const fs = require("fs");
const userDBFileName = "./models/user.json";
const { getCollection } = require("../models/db");
let questions = [];
let options = [];
let answers = [];
let correct;

function readUserDB() {
  let data = fs.readFileSync(userDBFileName, "utf-8");
  return JSON.parse(data);
}

function shuffle(array) {
  let currentIndex = array.length;
  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

async function generateQuestions() {
  let instance = axios.create();
  let response = await instance.get(
    "https://opentdb.com/api.php?amount=10&type=multiple"
  );
  console.log(response.data.results[0]);

  response.data.results.forEach((element) => {
    let question = { question: element.question };
    let choices = element.incorrect_answers;
    choices.push(element.correct_answer);
    questions.push(question);
    shuffle(choices);
    options.push(choices);
    answers.push(element.correct_answer);
  });
}

async function updateProfile() {
  let scores = [];
  let highScore = correct;
  const userEmail = readUserDB();
  const usersCollection = getCollection("users");
  const query = { email: userEmail };
  const result = await usersCollection.findOne(query);
  if(result.highScore > correct) {
    highScore = result.highScore;
  }
  scores = result.scores;
  scores.push(correct);
  const filter = { _id: result._id };
  const updateDocument = {
    $set: {
       highScore: highScore,
       scores: scores,
    },
 };
 const update = await usersCollection.updateOne(filter, updateDocument);
 console.log(update);

}

router.get("/", async function (req, res, next) {
  questions = [];
  options = [];
  answers = [];
  await generateQuestions();
  res.render("quiz", { questions: questions, options: options });
});

router.get("/results", function (req, res, next) {
  res.render("results", { correct: correct });
});

router.post("/results", (req, res) => {
  let answeredQuestions = JSON.parse(JSON.stringify(req.body));
  let submittedAnswers = [];
  submittedAnswers.push(...Object.values(answeredQuestions));
  let count = 0;
  for (let i = 0; i < answers.length; i++) {
    if (submittedAnswers[i] === answers[i]) {
      count++;
    }
    correct = count;
  }
  updateProfile();
  res.redirect("/quiz/results");
});

module.exports = router;
