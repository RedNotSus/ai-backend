import express from "express";
import chalk from "chalk";
import cors from "cors";
import paper from "./routes/whatbeatspaper.js";

const app = express();

const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.redirect("https://ch3n.cc");
});

app.use("/whatbeatspaper/compare", paper);

app.listen(3000, () => {
  console.log(
    chalk.green.bold("INFO | "),
    chalk.white(`Server is running on http://localhost:${port}`)
  );
});
