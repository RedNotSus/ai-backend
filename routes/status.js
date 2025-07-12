import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const API_KEY = "d47341a8dd3c4db39189a661faf1708e";
const router = express.Router();
let down = false;

router.get("/:user", async (req, res) => {
  const user = req.params.user;
  if (!user) {
    return res.status(400).json({ error: "User is required" });
  }

  let online = false;
  let location = "offline";
  let shards = null;

  try {
    const response = await axios.post(
      `https://api.donutsmp.net/v1/lookup/${user}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          Accept: "application/json",
        },
        validateStatus: function (status) {
          return status >= 200 && status < 600;
        },
      }
    );

    if (response.data.status === 500) {
      online = false;
    } else if (response.data.status === 200) {
      online = true;
      location = response.data.result.location;
    }

    const shardsdata = await axios.post(
      `https://api.donutsmp.net/v1/stats/${user}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          Accept: "application/json",
        },
      }
    );

    if (shardsdata.data.status === 200) {
      shards = shardsdata.data.result.shards;
    }

    return res.status(200).json({
      user,
      online,
      location,
      shards,
    });
  } catch (error) {
    console.error("Error fetching user status:", error);
    return res.status(500).json({
      error: "Error handling request",
      message:
        "Could not handle your request. This may be because the specified user/page/item does not exist.",
    });
  }
});

setInterval(async () => {
  try {
    console.log("Checking MCC status...");
    const response = await axios.get("https://api.ch3n.cc/donut/rednotsus");

    if (
      (!response.data.online && down === false) ||
      (response.data.location !== "Limbos" && down === false)
    ) {
      const time = Math.floor(Date.now() / 1000);
      await axios.post("https://api.ch3n.cc/discord", {
        message: `:warning:  **Issue Detected with MCC** \n Down as of: <t:${time}:R>`,
      });
      down = true;
      console.log("MCC marked as down");
    } else if (
      response.data.online &&
      down === true &&
      response.data.location === "Limbos"
    ) {
      await axios.post("https://api.ch3n.cc/discord", {
        message: `:white_check_mark: **MCC is back online**`,
      });
      down = false;
      console.log("MCC marked as back online");
    }
  } catch (error) {
    console.error("Error in MCC status check:", error);
  }
}, 30000);

export default router;
