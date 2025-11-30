import express from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(express.json());

const router = express.Router();

router.get("/create", async (req, res) => {
  axios
    .post(
      "https://engine.hyperbeam.com/v0/vm",
      {
        start_url: "https://google.com",
        adblock: true,
        search_engine: "google",
        dark: true,
        profile: true,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HYPERBEAM}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      res.json({
        room: response.data.session_id,
        url: response.data.embed_url,
      });
    })
    .catch((error) => {
      console.error("Error creating Hyperbeam session:", error);
      res.status(500).json({
        error: "An error occurred while creating the Hyperbeam session.",
      });
    });
});

router.get("/create/:profile", async (req, res) => {
  const profile = req.params.profile;
  axios
    .post(
      "https://engine.hyperbeam.com/v0/vm",
      {
        start_url: "https://google.com",
        adblock: true,
        search_engine: "google",
        dark: true,
        profile: profile,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HYPERBEAM}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      res.json({
        room: response.data.session_id,
        url: response.data.embed_url,
      });
    })
    .catch((error) => {
      console.error("Error creating Hyperbeam session:", error);
      res.status(500).json({
        error: "An error occurred while creating the Hyperbeam session.",
      });
    });
});

router.get("/list", async (req, res) => {
  axios
    .get("https://engine.hyperbeam.com/v0/vm", {
      headers: {
        Authorization: `Bearer ${process.env.HYPERBEAM}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      console.error("Error listing Hyperbeam sessions:", error);
      res.status(500).json({
        error: "An error occurred while listing the Hyperbeam sessions.",
      });
    });
});

router.get("/delete/:id", async (req, res) => {
  const sessionId = req.params.id;
  axios
    .delete(`https://engine.hyperbeam.com/v0/vm/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${process.env.HYPERBEAM}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      res.json({
        message: `Session ${sessionId} deleted successfully.`,
      });
    })
    .catch((error) => {
      console.error("Error deleting Hyperbeam session:", error);
      res.status(500).json({
        error: "An error occurred while deleting the Hyperbeam session.",
      });
    });
});

//returns session_id, embed_url, creation_date
router.get("/info/:id", async (req, res) => {
  const sessionId = req.params.id;
  axios
    .get(`https://engine.hyperbeam.com/v0/vm/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${process.env.HYPERBEAM}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      console.error("Error getting Hyperbeam session info:", error);
      res.status(500).json({
        error: "An error occurred while getting the Hyperbeam session info.",
      });
    });
});

export default router;
