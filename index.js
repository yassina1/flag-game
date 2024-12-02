import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:blueflower123@localhost:5432/world",
  ssl: process.env.DATABASE_URL ? {
    rejectUnauthorized: false
  } : false
});

const app = express();
const port = process.env.PORT || 3000;

let quiz = [];

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {};

// GET home page
app.get("/", async (req, res) => {
  try {
    if (quiz.length === 0) {
      const result = await db.query("SELECT * FROM flags");
      quiz = result.rows;
    }
    totalCorrect = 0;
    await nextQuestion();
    res.render("index.ejs", { question: currentQuestion });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Error");
  }
});

// POST a new post
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;
  if (currentQuestion.name.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
  }

  nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

async function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];

  currentQuestion = randomCountry;
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
