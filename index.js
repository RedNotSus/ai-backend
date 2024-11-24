import express from "express";
import chalk from "chalk";
import cors from "cors";
import paper from "./routes/whatbeatspaper.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.redirect("https://ch3n.cc");
});

app.use("/whatbeatspaper/compare", paper);

app.listen(process.env.PORT, () => {
  console.log(
    chalk.green.bold("INFO | "),
    chalk.white(`Server is running on http://localhost:${port}`)
  );
});
