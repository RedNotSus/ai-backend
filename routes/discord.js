import express from "express";
import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
});

client.once("ready", () => {
  console.log("Discord bot is ready!");
});

client.login(process.env.DISCORD_BOT_TOKEN);

const router = express.Router();
router.use(express.json());

router.post("/", async (req, res) => {
  const userId = "735641273477890178";
  const user = await client.users.fetch(userId);
  if (user) {
    user
      .send(req.body.message, null, 2)
      .then(() => {
        res.status(200).json({ message: "Message sent to Discord user" });
      })
      .catch((error) => {
        console.error("Error sending message to Discord user:", error);
        res
          .status(500)
          .json({ error: "Failed to send message to Discord user" });
      });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

export default router;
