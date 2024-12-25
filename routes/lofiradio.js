import express from "express";
import playlist from "../assets/songlist.json" assert { type: "json" };

const app = express();
app.use(express.json());

let timestamp = 0;
let song = "";
let artist = "";
let cover = "";
let url = "";
let duration = 0;

let currentposition = 0;
const viewers = new Map();

function nextSong() {
  if (currentposition < playlist.length - 1) {
    currentposition++;
  } else {
    currentposition = 0;
  }
  song = playlist[currentposition].song;
  artist = playlist[currentposition].artist;
  cover = playlist[currentposition].cover;
  url = playlist[currentposition].url;
  duration = playlist[currentposition].duration;
}

if (!song) {
  song = playlist[currentposition].song;
  artist = playlist[currentposition].artist;
  cover = playlist[currentposition].cover;
  url = playlist[currentposition].url;
  duration = playlist[currentposition].duration;
}

setInterval(() => {
  timestamp++;
  if (timestamp >= duration) {
    nextSong();
    timestamp = 0;
  }
}, 1000);

const router = express.Router();
router.get("/", (req, res) => {
  res.json({
    song: song,
    artist: artist,
    cover: cover,
    url: url,
    duration: duration,
    timestamp: timestamp,
    viewers: viewers.size,
  });
});

function cleanupViewers() {
  const now = Date.now();
  for (const [id, lastHeartbeat] of viewers.entries()) {
    if (now - lastHeartbeat > 30000) {
      viewers.delete(id);
    }
  }
}

router.post("/heartbeat", (req, res) => {
  const id = req.body.id;

  if (!id) {
    return res.status(400).json({
      error: "Please provide an id in the request body",
    });
  }
  viewers.set(id, Date.now());

  res.json({ status: "ok", viewers: viewers.size });
});

router.get("/nextsong", (req, res) => {
  let next = currentposition + 1;
  if (next >= playlist.length) {
    next = 0;
  }
  res.json({
    song: playlist[next].song,
    artist: playlist[next].artist,
    cover: playlist[next].cover,
    url: playlist[next].url,
    duration: playlist[next].duration,
  });
});
setInterval(cleanupViewers, 5000);
export default router;
