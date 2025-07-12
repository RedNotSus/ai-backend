import express from "express";
import dotenv from "dotenv";
import { Sequelize, DataTypes } from "sequelize";
dotenv.config();
const urlRegex =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

const db = new Sequelize(process.env.SHORTENER_DATABASE_URL);
const ShortUrl = db.define("ShortUrl", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  alias: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
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
router.post("/", async (req, res) => {
  const { alias, url } = req.body;
  if (!alias || !url) {
    return res.status(400).json({
      error: "Please provide both alias and url in the request body",
    });
  }
  if (url.length > 255) {
    url = url.slice(0, 255);
  }
  const existing = await ShortUrl.findOne({
    where: {
      alias,
    },
  });
  if (existing) {
    return res.status(409).json({
      error: "Alias already in use",
    });
  }
  if (!urlRegex.test(url)) {
    return res.status(400).json({
      error: "Invalid URL format",
    });
  }
  await ShortUrl.create({
    alias,
    url,
  });
  return res.status(201).json({
    alias,
    url,
  });
});

export default router;
