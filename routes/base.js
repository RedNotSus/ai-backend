import express from "express";
import dotenv from "dotenv";
import { Sequelize, DataTypes } from "sequelize";
dotenv.config();
const urlRegex =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

const app = express();
app.use(express.json());

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

const router = express.Router();
router.post("/shorten", async (req, res) => {
  const { alias, url } = req.body;
  if (!alias || !url) {
    return res.status(400).json({
      error: "Please provide both alias and url in the request body",
    });
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

let city = "Houston";
let state = "Texas";
let country = "United States";
let slack_id = "U07V73EEF42";
let extra =
  "im hosting this on coolify running on a free oracle cloud instance!";

router.get("/api", (req, res) => {
  res.json({
    city,
    state,
    country,
    slack_id,
    extra,
  });
});

router.get("/:slug", async (req, res) => {
  const slug = req.params.slug;
  try {
    const fullUrl = await ShortUrl.findOne({
      where: {
        alias: slug,
      },
    });

    if (fullUrl) {
      res.redirect(fullUrl.url);
    } else {
      res.status(404).send("URL not found");
    }
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});
export default router;
