const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { number } = req.body;
    if (!number) return res.status(400).json({ error: 'Phone number required' });

    // 1. Establish session
    const sessionRes = await axios.get('https://baron0.com/free', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const setCookie = sessionRes.headers['set-cookie'];
    const cookies = setCookie ? setCookie.map(c => c.split(';')[0]).join('; ') : '';

    // 2. Query target endpoint
    const response = await axios.post(
      'https://baron0.com/check-numberr2',
      { number },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Origin': 'https://baron0.com',
          'Referer': 'https://baron0.com/free',
          'Cookie': cookies,
          'X-Requested-With': 'XMLHttpRequest'
        },
        timeout: 8000
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    // Print real error reason to debug
    const status = error.response ? error.response.status : 500;
    const details = error.response ? error.response.data : error.message;

    return res.status(status).json({
      error: 'Failed to process request',
      statusCode: status,
      details: details
    });
  }
};
