import express from "express";
import chalk from "chalk";
import cors from "cors";
import paper from "./routes/whatbeatspaper.js";
import lofi from "./routes/lofiradio.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.redirect("https://ch3n.cc");
});

app.use("/whatbeatspaper/compare", paper);
app.use("/currentsong", lofi);

app.listen(port, () => {
  console.log(
    chalk.green.bold("INFO | "),
    chalk.white(`Server is running on http://localhost:${port}`)
  );
});
