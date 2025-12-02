const Database = require('better-sqlite3');
const crypto = require('crypto');
const path = require('path');

const db = new Database(path.join(__dirname, 'languagebot.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    encrypted_key TEXT NOT NULL,
    iv TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS conversation_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    words_input TEXT,
    exam_description TEXT,
    language TEXT,
    level TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
  CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
  CREATE INDEX IF NOT EXISTS idx_conversation_settings_user_id ON conversation_settings(user_id);
`);

// Encryption utilities
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
if (!process.env.ENCRYPTION_KEY) {
  console.warn('WARNING: ENCRYPTION_KEY not set in .env. Using a random key. Set ENCRYPTION_KEY in .env for production!');
}

function encryptApiKey(apiKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex'), iv);
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    encrypted: encrypted,
    iv: iv.toString('hex')
  };
}

function decryptApiKey(encryptedKey, iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex'), Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// User operations
function createOrUpdateUser(googleId, email, name) {
  const stmt = db.prepare(`
    INSERT INTO users (google_id, email, name)
    VALUES (?, ?, ?)
    ON CONFLICT(google_id) DO UPDATE SET
      email = excluded.email,
      name = excluded.name
    RETURNING *
  `);
  return stmt.get(googleId, email, name);
}

function getUserByGoogleId(googleId) {
  const stmt = db.prepare('SELECT * FROM users WHERE google_id = ?');
  return stmt.get(googleId);
}

// API key operations
function saveApiKey(userId, apiKey) {
  const { encrypted, iv } = encryptApiKey(apiKey);
  const stmt = db.prepare(`
    INSERT INTO api_keys (user_id, encrypted_key, iv)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      encrypted_key = excluded.encrypted_key,
      iv = excluded.iv,
      updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(userId, encrypted, iv);
  return true;
}

function getApiKey(userId) {
  const stmt = db.prepare('SELECT encrypted_key, iv FROM api_keys WHERE user_id = ?');
  const result = stmt.get(userId);

  if (!result) {
    return null;
  }

  return decryptApiKey(result.encrypted_key, result.iv);
}

function deleteApiKey(userId) {
  const stmt = db.prepare('DELETE FROM api_keys WHERE user_id = ?');
  stmt.run(userId);
}

// Conversation settings operations
function saveConversationSettings(userId, settings) {
  const stmt = db.prepare(`
    INSERT INTO conversation_settings (user_id, words_input, exam_description, language, level)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      words_input = excluded.words_input,
      exam_description = excluded.exam_description,
      language = excluded.language,
      level = excluded.level,
      updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(userId, settings.wordsInput, settings.examDescription, settings.language, settings.level);
  return true;
}

function getConversationSettings(userId) {
  const stmt = db.prepare('SELECT words_input, exam_description, language, level FROM conversation_settings WHERE user_id = ?');
  const result = stmt.get(userId);

  if (!result) {
    return null;
  }

  return {
    wordsInput: result.words_input,
    examDescription: result.exam_description,
    language: result.language,
    level: result.level
  };
}

module.exports = {
  db,
  createOrUpdateUser,
  getUserByGoogleId,
  saveApiKey,
  getApiKey,
  deleteApiKey,
  saveConversationSettings,
  getConversationSettings
};
