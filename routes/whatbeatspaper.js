import express from "express";
import axios from "axios";
import chalk from "chalk";
import dotenv from "dotenv";
import { Sequelize, DataTypes } from "sequelize";
dotenv.config();

const db = new Sequelize(process.env.DATABASE_URL);
const cache = db.define("cache", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  item1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  item2: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  result: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  explanation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  emoji: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
console.log(
  chalk.green.bold("INFO | "),
  chalk.white("Synchronizing models...")
);
db.sync()
  .then(() => {
    console.log("All models were synchronized successfully.");
  })
  .catch((error) => {
    console.error("Error synchronizing models:", error);
  });

console.log(chalk.green.bold("INFO | "), chalk.white("Models synchronized"));
dotenv.config();

const app = express();
app.use(express.json());

const router = express.Router();
router.post("/", async (req, res) => {
  const { item1, item2 } = req.body;
  if (!item1 || !item2) {
    return res.status(400).json({
      error: "Please provide both item1 and item2 in the request body",
    });
  }

  const cachedResult = await cache.findOne({
    where: {
      item1,
      item2,
    },
  });

  if (cachedResult) {
    return res.json({
      result: cachedResult.result,
      explanation: cachedResult.explanation,
      emoji: cachedResult.emoji,
      cached: true,
    });
  }

  try {
    console.log("INFO | Sending request to API...");
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.2-90b-text-preview",
        messages: [
          {
            role: "system",
            content:
              'You are an AI that evaluates interactions between two items and responds with a JSON object containing `result` (boolean if item2 beats item1), `explanation` (short reasoning), and `emoji` the best representation of item2. The input will be two items separated by `|` (e.g., `fire|water`). Use common logic or themes to determine the outcome. Respond in JSON format, e.g., {"result": true, "explanation": "Water extinguishes fire.", "emoji": "💧"}.',
          },
          { role: "user", content: `${item1} | ${item2}` },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    );

    let resultData;
    try {
      resultData = JSON.parse(response.data.choices[0].message.content);
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      return res.status(500).json({
        error: "Invalid response format from API.",
      });
    }

    await cache.create({
      item1,
      item2,
      result: resultData.result,
      explanation: resultData.explanation,
      emoji: resultData.emoji,
    });

    return res.json({
      result: resultData.result,
      explanation: resultData.explanation,
      emoji: resultData.emoji,
      cached: false,
    });
  } catch (error) {
    console.error("Error fetching data from API:", error);
    return res.status(500).json({
      error: "An error occurred while processing your request.",
    });
  }
});

// changes the result from true to false and vice versa
router.post("/toggle", async (req, res) => {
  const { item1, item2 } = req.query;
  if (!item1 || !item2) {
    return res.status(400).json({
      error: "Please provide both item1 and item2 in the request query",
    });
  }

  const cachedResult = await cache.findOne({
    where: {
      item1,
      item2,
    },
  });

  if (!cachedResult) {
    return res.status(404).json({
      error: "No cached result found for the given items.",
    });
  }

  const updatedResult = !cachedResult.result;
  await cachedResult.update({
    result: updatedResult,
  });

  return res.json({
    result: updatedResult,
    explanation: cachedResult.explanation,
    emoji: cachedResult.emoji,
  });
});
export default router;
