require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const session = require('express-session');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

const {
  createOrUpdateUser,
  saveApiKey,
  getApiKey,
  deleteApiKey,
  saveConversationSettings,
  getConversationSettings
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Cookie secure setting:', process.env.NODE_ENV === 'production');

if (!process.env.SESSION_SECRET) {
  console.warn('WARNING: SESSION_SECRET not set in .env. Using a random secret. Set SESSION_SECRET in .env for production!');
}

// Initialize Google OAuth client
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Authentication middleware
function requireAuth(req, res, next) {
  console.log('requireAuth check - session:', req.session);
  console.log('requireAuth check - userId:', req.session.userId);
  if (!req.session.userId) {
    console.error('Authentication failed: No userId in session');
    return res.status(401).json({ error: 'Not authenticated' });
  }
  console.log('Authentication passed for user:', req.session.userId);
  next();
}

// Auth endpoints
app.post('/auth/google', async (req, res) => {
  try {
    console.log('Authentication attempt received');
    const { credential } = req.body;

    if (!credential) {
      console.error('No credential provided');
      return res.status(400).json({ error: 'No credential provided' });
    }

    if (!GOOGLE_CLIENT_ID) {
      console.error('GOOGLE_CLIENT_ID not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    console.log('Verifying token with Google...');
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const googleId = payload['sub'];
    const email = payload['email'];
    const name = payload['name'];

    console.log('Token verified, creating/updating user:', email);
    // Create or update user in database
    const user = createOrUpdateUser(googleId, email, name);

    // Set session
    req.session.userId = user.id;
    req.session.googleId = user.google_id;
    req.session.email = user.email;

    console.log('Authentication successful for user:', email);
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    console.error('Error details:', error.message);
    res.status(401).json({ error: 'Authentication failed', details: error.message });
  }
});

app.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

app.get('/auth/status', (req, res) => {
  if (req.session.userId) {
    res.json({
      authenticated: true,
      user: {
        id: req.session.userId,
        email: req.session.email
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// API key endpoints
app.post('/api/user/api-key', requireAuth, async (req, res) => {
  try {
    console.log('API key save request received for user:', req.session.userId);
    const { apiKey } = req.body;

    if (!apiKey || typeof apiKey !== 'string') {
      console.error('Invalid API key format');
      return res.status(400).json({ error: 'Invalid API key' });
    }

    console.log('Saving API key to database...');
    saveApiKey(req.session.userId, apiKey);
    console.log('API key saved successfully');

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving API key:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to save API key' });
  }
});

app.get('/api/user/api-key', requireAuth, async (req, res) => {
  try {
    const apiKey = getApiKey(req.session.userId);

    if (!apiKey) {
      return res.status(404).json({ error: 'No API key found' });
    }

    res.json({ hasApiKey: true });
  } catch (error) {
    console.error('Error retrieving API key:', error);
    res.status(500).json({ error: 'Failed to retrieve API key' });
  }
});

app.delete('/api/user/api-key', requireAuth, async (req, res) => {
  try {
    deleteApiKey(req.session.userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

// Conversation settings endpoints
app.post('/api/user/conversation-settings', requireAuth, async (req, res) => {
  try {
    console.log('Conversation settings save request received for user:', req.session.userId);
    const { wordsInput, examDescription, language, level } = req.body;

    console.log('Saving conversation settings to database...');
    saveConversationSettings(req.session.userId, { wordsInput, examDescription, language, level });
    console.log('Conversation settings saved successfully');

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving conversation settings:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to save conversation settings' });
  }
});

app.get('/api/user/conversation-settings', requireAuth, async (req, res) => {
  try {
    const settings = getConversationSettings(req.session.userId);

    if (!settings) {
      return res.json({ hasSettings: false });
    }

    res.json({ hasSettings: true, settings });
  } catch (error) {
    console.error('Error retrieving conversation settings:', error);
    res.status(500).json({ error: 'Failed to retrieve conversation settings' });
  }
});

// Gemini API proxy endpoints
// These endpoints use the user's stored API key OR the server's fallback key
app.post('/api/gemini/*path', requireAuth, async (req, res) => {
  try {
    const thirdPartyBaseUrl = 'https://generativelanguage.googleapis.com';
    const apiPath = req.path.replace(/^\/api\/gemini/, '');
    const url = new URL(apiPath, thirdPartyBaseUrl).toString();

    // Try to get user's API key, fallback to server key
    let apiKey = getApiKey(req.session.userId);

    if (!apiKey) {
      if (!GEMINI_API_KEY) {
        return res.status(400).json({
          error: 'No API key configured. Please add your Gemini API key in settings.'
        });
      }
      apiKey = GEMINI_API_KEY;
    }

    const headers = { ...req.headers };
    headers['x-goog-api-key'] = apiKey;
    delete headers.host;
    delete headers.cookie;

    const response = await axios.post(url, req.body, { headers });
    res.status(response.status).json(response.data);

  } catch (error) {
    console.error('Gemini API proxy error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Failed to fetch data from Gemini API' });
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
