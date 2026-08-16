import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';

export default async function handler(req, res) {
  // Allow any domain to fetch from this API (CORS enabled)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed. Use POST.' });

  try {
    const { number } = req.body;

    if (!number) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    // Clean phone number format
    const cleanNumber = number.replace(/[^0-9]/g, '');
    const jid = `${cleanNumber}@s.whatsapp.net`;

    const { state } = await useMultiFileAuthState('/tmp/auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      connectTimeoutMs: 8000
    });

    // Native WhatsApp existence check
    const [result] = await sock.onWhatsApp(jid);

    return res.status(200).json({
      number: cleanNumber,
      banned: !result?.exists,
      reason: result?.exists ? 'Active on WhatsApp' : 'Number not registered or banned'
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to process WhatsApp check',
      details: error.message
    });
  }
}
