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
const viewers = new Set();

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
  console.log(song, artist, cover, url, duration, timestamp, viewers.size);
});

router.post("/heartbeat", (req, res) => {
  const id = req.body.id;

  if (!id) {
    return res.status(400).json({
      error: "Please provide an id in the request body",
    });
  }
  viewers.add(id);

  setTimeout(() => {
    viewers.delete(id);
  }, 30000);

  res.json({ status: "ok" });
});

export default router;
