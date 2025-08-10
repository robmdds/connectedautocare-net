
import 'reflect-metadata';
import * as dotenv from 'dotenv'; dotenv.config();
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/health', (_, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// Helcim stubs
app.post('/payments/intent', (req, res) => {
  const amount = Number(req.body?.amount || 0);
  const currency = String(req.body?.currency || 'USD');
  return res.json({
    provider: 'helcim',
    amount, currency,
    clientSecret: 'mock_client_secret_replace_with_helcim_token'
  });
});

app.post('/webhooks/helcim', (req, res) => {
  const event = req.body || {};
  if (event?.type === 'payment.succeeded') {
    // TODO: Verify signature via HELCIM_WEBHOOK_SECRET
    const policyNumber = `POL-${Date.now()}`;
    return res.json({ received: true, issued: { policyNumber } });
  }
  return res.json({ received: true });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
