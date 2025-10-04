import express from "express";
import dotenv from "dotenv";
import { Sequelize, DataTypes } from "sequelize";

function generatePassword() {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const special = "!@#$%&?";

  const allChars = lowercase + uppercase + numbers + special;

  const passwordLength = 10;
  let chars = [];
  chars.push(special[Math.floor(Math.random() * special.length)]);

  for (let i = 1; i < passwordLength; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length);
    chars.push(allChars[randomIndex]);
  }

  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = chars[i];
    chars[i] = chars[j];
    chars[j] = tmp;
  }

  return chars.join("");
}

dotenv.config();
const db = new Sequelize(process.env.SPACESHIP_DB);
const Spaceship = db.define("Spaceship", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

db.sync();

const app = express();
app.use(express.json());

const router = express.Router();

router.use((req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

router.post("/new", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({
      error: "Missing Headers",
    });
  }
  const username = `55gms` + Math.floor(Math.random() * 10000);
  const password = generatePassword();
  const email = `${username}@ch3n.cc`;
  await Spaceship.create({
    username,
    password,
    email,
    url,
  });
  res.status(201).json({
    message: "Spaceship account saved",
    username,
    password,
    email,
    url,
  });
});

router.post("/search", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({
      error: "Missing Headers",
    });
  }
  const account = await Spaceship.findOne({
    where: {
      url,
    },
  });
  if (!account) {
    return res.status(404).json({
      error: "No account found for this URL",
    });
  }
  res.status(200).json({
    username: account.username,
    password: account.password,
    email: account.email,
    url: account.url,
  });
});

export default router;
