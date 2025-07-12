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
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are judging a game of 'Chain of Beats' where you determine if the second item can defeat the first item through any logical or creative means. Think creatively but maintain some basic logic - the connection should make sense! Respond only in JSON format with a boolean 'result' (true if item2 beats item1), a playful one-sentence 'explanation' (<100 chars), and a single relevant 'emoji'. Example: For "paper | fire" respond: {"result": true, "explanation": "Fire gleefully turns paper into tiny gray snowflakes of ash!", "emoji": "🔥"} do not break the formatting for example make sure there are always quotes on emoji and it is valid json. The result is one of the most important aspects, make sure your result reflects from your explanation, for example if your explanation talks about how item2 can beat item1, your response should be true and vice versa`,
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
      console.error("Response data:", response.data);
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
router.post("/delete", async (req, res) => {
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

  await cachedResult.destroy();

  return res.json({
    message: "Successfully deleted cached result.",
  });
});
export default router;
