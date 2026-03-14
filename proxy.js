export default async function handler(req, res) {
  // Allow all origins (CORS fix)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const APPS_SCRIPT_URL = process.env.VITE_GOOGLE_WEB_APP_URL;
  if (!APPS_SCRIPT_URL) {
    return res.status(500).json({ error: 'VITE_GOOGLE_WEB_APP_URL not configured' });
  }

  try {
    let response;
    if (req.method === 'GET') {
      const params = new URLSearchParams(req.query).toString();
      response = await fetch(`${APPS_SCRIPT_URL}?${params}`);
    } else {
      response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(req.body),
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
