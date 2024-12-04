import express from "express";

const app = express();
app.use(express.json());

let city = "Houston";
let state = "Texas";
let country = "United States";
let slack_id = "U07V73EEF42";
let extra =
  "im hosting this on coolify running on a free oracle cloud instance!";

const router = express.Router();
router.get("/", (req, res) => {
  res.json({
    city,
    state,
    country,
    slack_id,
    extra,
  });
});
export default router;
