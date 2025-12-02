# Deployment Guide for LanguageBot

This guide will help you deploy LanguageBot as a secure public web application.

## Quick Start Checklist

- [ ] Set up Google OAuth 2.0 credentials
- [ ] Configure environment variables
- [ ] Set up the database
- [ ] Configure the frontend
- [ ] Deploy to your hosting platform
- [ ] Test authentication and API key storage

## Detailed Deployment Steps

### 1. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Google+ API" or "Google Identity Services"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen if not already done
6. Create "Web application" credentials
7. Add authorized JavaScript origins:
   - For production: `https://yourdomain.com`
   - For local dev: `http://localhost:3000`
8. Copy the Client ID

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy from example
cp .env.example .env
```

Edit `.env` and set these required variables:

```bash
GOOGLE_CLIENT_ID=your_actual_google_client_id
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

Optional but recommended:
```bash
GEMINI_API_KEY=your_gemini_api_key  # Fallback for users without API keys
NODE_ENV=production
PORT=3000
```

### 3. Frontend Configuration

Configure the Google Client ID for the frontend:

```bash
# Copy example config
cp public/config.js.example public/config.js
```

Edit `public/config.js`:
```javascript
window.APP_CONFIG = {
  GOOGLE_CLIENT_ID: 'your_actual_google_client_id'
};
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Database Setup

The database will be automatically created on first run. The application uses SQLite with the following features:

- Encrypted user API keys (AES-256-CBC)
- User profile storage
- Automatic schema migration

The database file (`languagebot.db`) will be created in the root directory.

**Important**: Backup this file regularly as it contains user data.

### 6. Local Testing

Before deploying, test locally:

```bash
node index.js
```

Visit `http://localhost:3000` and:
1. Sign in with Google
2. Add a test API key
3. Start a conversation
4. Verify data persists after logout/login

### 7. Deployment Options

#### Option A: Traditional VPS (DigitalOcean, Linode, etc.)

1. SSH into your server
2. Install Node.js 16+
3. Clone the repository
4. Follow steps 2-5 above
5. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start index.js --name languagebot
   pm2 save
   pm2 startup
   ```
6. Set up nginx as a reverse proxy
7. Configure SSL with Let's Encrypt

#### Option B: Heroku

1. Create a Heroku app:
   ```bash
   heroku create your-app-name
   ```

2. Set environment variables:
   ```bash
   heroku config:set GOOGLE_CLIENT_ID=your_client_id
   heroku config:set SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   heroku config:set ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   heroku config:set NODE_ENV=production
   ```

3. Create a `Procfile`:
   ```
   web: node index.js
   ```

4. Deploy:
   ```bash
   git push heroku main
   ```

5. Update Google OAuth origins with your Heroku URL

#### Option C: Google Cloud Run / App Engine

1. Create `app.yaml`:
   ```yaml
   runtime: nodejs18
   env_variables:
     NODE_ENV: 'production'
   ```

2. Deploy:
   ```bash
   gcloud app deploy
   ```

3. Set environment variables in GCP Console
4. Update OAuth origins

### 8. Security Considerations

✅ **Implemented Security Features:**
- Server-side OAuth verification
- Encrypted API key storage (AES-256-CBC)
- HTTP-only session cookies
- CSRF protection
- No sensitive data in client-side storage
- All API calls proxied through backend

⚠️ **Additional Recommendations:**

1. **Use HTTPS in production** - Set `NODE_ENV=production` to enable secure cookies
2. **Regular backups** - Backup `languagebot.db` regularly
3. **Key rotation** - Rotate SESSION_SECRET and ENCRYPTION_KEY periodically
4. **Rate limiting** - Consider adding rate limiting for API endpoints
5. **Monitoring** - Set up logging and error monitoring
6. **Database scaling** - For high traffic, consider migrating to PostgreSQL

### 9. Updating OAuth Origins

After deployment, update your Google OAuth settings:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "Credentials"
4. Edit your OAuth 2.0 Client ID
5. Add your production URL to "Authorized JavaScript origins"
6. Example: `https://languagebot.yourdomain.com`

### 10. Troubleshooting

**Problem**: "Authentication failed" error
- **Solution**: Verify GOOGLE_CLIENT_ID is correct in both `.env` and `public/config.js`

**Problem**: "Failed to save API key" error
- **Solution**: Check that ENCRYPTION_KEY is set in `.env`

**Problem**: Session not persisting
- **Solution**: Verify SESSION_SECRET is set and cookies are enabled

**Problem**: Database errors
- **Solution**: Check file permissions on `languagebot.db` and ensure write access

### 11. Monitoring and Maintenance

- Check logs regularly: `pm2 logs languagebot` (if using PM2)
- Monitor disk space (database grows with users)
- Update dependencies: `npm update`
- Backup database before updates

## Support

For issues, please open a GitHub issue at: https://github.com/ryaalbr/LanguageBot/issues
