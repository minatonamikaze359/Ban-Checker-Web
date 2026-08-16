const axios = require('axios');

module.exports = async (req, res) => {
  // Allow ANY domain, site, or app to call this API (Public CORS)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle browser preflight CORS check
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { number } = req.body;

    if (!number) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    // Get session/cookies from target source
    const sessionRes = await axios.get('https://baron0.com/free', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const cookies = sessionRes.headers['set-cookie'];

    // Forward request to source API
    const response = await axios.post(
      'https://baron0.com/check-numberr2',
      { number },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Origin': 'https://baron0.com',
          'Referer': 'https://baron0.com/free',
          'Cookie': cookies ? cookies.join('; ') : ''
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to process request',
      details: error.response ? error.response.data : error.message
    });
  }
};
