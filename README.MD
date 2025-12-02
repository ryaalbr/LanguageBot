# LanguageBot

LanguageBot is a website that allows students to have and document Chinese conversations with a large language model.

## Quick Start

Use the automated setup wizard:

```bash
npm install
npm run setup
npm start
```

The setup wizard will guide you through configuration and generate secure keys automatically.

## Installation

### For Deployment (Recommended for Public Web App)

This application is designed to be deployed as a secure web application where users sign in with Google and their API keys are stored securely in a database.

#### Prerequisites

1. A server or hosting platform (e.g., Heroku, DigitalOcean, AWS, Google Cloud)
2. Node.js 16+ installed
3. A Google Cloud project with OAuth 2.0 credentials
4. (Optional) A Gemini API key for fallback/testing

#### Setup Steps

1. **Clone the repository:**
```bash
git clone https://github.com/ryaalbr/LanguageBot.git
cd LanguageBot
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up Google OAuth 2.0:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Sign-In API
   - Create OAuth 2.0 credentials (Client ID for Web Application)
   - Add your domain to authorized JavaScript origins (e.g., `https://yourdomain.com`)
   - For local testing, add `http://localhost:3000`
   - Copy your Client ID

4. **Configure environment variables:**

Create a `.env` file in the root directory:
```bash
# Required
GOOGLE_CLIENT_ID=your_google_client_id_here
SESSION_SECRET=your_random_session_secret_here
ENCRYPTION_KEY=your_random_encryption_key_here

# Optional (for fallback API access)
GEMINI_API_KEY=your_gemini_api_key_here

# Production setting
NODE_ENV=production
```

Generate secure random keys:
```bash
# For SESSION_SECRET and ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. **Configure the frontend:**

Edit `public/config.js` and add your Google Client ID:
```javascript
window.APP_CONFIG = {
  GOOGLE_CLIENT_ID: 'your_google_client_id_here'
};
```

6. **Run the application:**
```bash
node index.js
```

The server will start on port 3000 by default (or the port specified in `PORT` environment variable).

### For Local Development Only

If you want to run LanguageBot locally for development:

1. Follow steps 1-5 above
2. Use `http://localhost:3000` in your Google OAuth authorized origins
3. Run `node index.js`
4. Access the app at [http://localhost:3000/](http://localhost:3000/)

## How to Use

### Landing Page

The landing page displays a welcome message and a "Sign in with Google" button. Click the button to sign in with your Google account. After signing in, you'll be redirected to the Input Page.

### Input Page

After signing in, you'll see:
- A logout button to sign out and return to the landing page
- An input field for your Gemini API key (this will be securely encrypted and stored in the database)
- An input field for words and phrases you want to practice (separated by line breaks)
- An input field for the conversation description
- Language and proficiency level selectors

Fill out all fields and click "Submit" to proceed to the Start Page. Your API key is optional - if you don't provide one, the application will use the server's fallback API key (if configured).

### Start Page

This page will tell you the instructions for the conversation. Click the "Start Conversation" button when you are ready to converse.

### Conversation Page

Pay attention to what the LLM is saying and respond back. When you are done responding to the LLM, click the "End Message" button. Your responses will be transcribed and prompted into the model, to which the model will reply.

Make sure to use the required vocabulary throughout your entire conversation. Once you are done conversing, click the "End Conversation" button.

### Report Page

After your conversation, you will be given a report on your performance. This report will include a transcript of your conversation, a score denoting how much of the desired vocabulary you used, and written grammar feedback from an LLM. From there, you can print out the report or restart to start a new test.

## Features

- **Secure Authentication**: Google Sign-In with server-side session management
- **Encrypted Storage**: User API keys are encrypted using AES-256-CBC and stored securely in a SQLite database
- **Multi-language Support**: Practice Chinese, Japanese, Spanish, or English
- **ACTFL Proficiency Levels**: Choose from Novice, Intermediate, Advanced, Superior, or Distinguished levels
- **Real-time Interaction**: Speech recognition and text-to-speech for natural conversations
- **Automatic Transcription**: Complete conversation history with speaker identification
- **Vocabulary Tracking**: Automatic highlighting of required vocabulary usage
- **AI-Powered Feedback**: Personalized grammar feedback from Gemini
- **Privacy First**: API keys never exposed to the client, all sensitive data encrypted at rest

## Security Features

- Server-side Google OAuth 2.0 authentication
- Encrypted API key storage using AES-256-CBC
- HTTP-only session cookies
- CSRF protection via session management
- No sensitive data stored in browser localStorage
- All API calls proxied through the backend
- Secure session secrets and encryption keys

## Next Steps/Issues

- Send report to email
- Persistent account storage
- Creating exam links
- Advanced vocabulary tracking