export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // ← ここがCORS設定
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // プリフライトリクエストに対応
  }

  const API_KEY = process.env.API_KEY;
  const CHANNEL_ID = process.env.CHANNEL_ID;

  if (!API_KEY || !CHANNEL_ID) {
    return res.status(500).json({ error: 'Missing API_KEY or CHANNEL_ID' });
  }

  try {
    const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet&order=date&maxResults=5&type=video`);
    const searchData = await searchRes.json();

    for (const item of searchData.items || []) {
      const videoId = item.id.videoId;
      const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&key=${API_KEY}&id=${videoId}`);
      const videoData = await videoRes.json();

      const status = videoData.items?.[0]?.snippet?.liveBroadcastContent;

      if (status === 'live' || status === 'none') {
        return res.status(200).json({ videoId });
      }
    }

    return res.status(404).json({ error: '動画が見つかりませんでした' });
  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
