require('dotenv').config(); // .env から環境変数を読み込む

const express = require('express');
const fetch = require('node-fetch'); // v2.x 用（v3 を使っているなら import 対応が必要）

const API_KEY = process.env.API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/latest-video', async (req, res) => {
  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet&order=date&maxResults=5&type=video`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.items) {
      console.log("Search API error:", searchData);
      return res.status(500).json({ error: '検索エラー', detail: searchData });
    }

    for (const item of searchData.items) {
      const videoId = item.id.videoId;
      const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&key=${API_KEY}&id=${videoId}`;
      const videoRes = await fetch(videoUrl);
      const videoData = await videoRes.json();

      const broadcastStatus = videoData.items[0]?.snippet?.liveBroadcastContent;

      if (broadcastStatus === 'live' || broadcastStatus === 'none') {
        return res.json({ videoId });
      }
    }

    res.status(404).json({ error: '動画が見つかりませんでした' });
  } catch (err) {
    console.error("全体エラー:", err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});