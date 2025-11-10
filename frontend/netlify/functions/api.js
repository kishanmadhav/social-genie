// Main API handler for Netlify Functions (moved under frontend for Netlify base directory convenience)
const express = require('express');
const serverless = require('serverless-http');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.NETLIFY_URL || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/.netlify/functions/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Social Genie API is running' });
});

app.get('/auth/google', (req, res) => {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}&response_type=code&scope=profile email`;
  res.redirect(authUrl);
});

app.get('/auth/twitter', (req, res) => {
  const authUrl = `https://twitter.com/i/oauth2/authorize?client_id=${process.env.TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.TWITTER_CALLBACK_URL)}&response_type=code&scope=tweet.read tweet.write users.read offline.access`;
  res.redirect(authUrl);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/user', (req, res) => {
  res.json({ message: 'User endpoint' });
});

app.post('/api/tweet', (req, res) => {
  res.json({ message: 'Tweet endpoint' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

exports.handler = serverless(app);
