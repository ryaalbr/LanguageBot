#!/usr/bin/env node

/**
 * Setup script for LanguageBot
 * Helps generate secure keys and set up configuration files
 */

const crypto = require('crypto');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function generateSecureKey() {
  return crypto.randomBytes(32).toString('hex');
}

async function setup() {
  console.log('\n🤖 LanguageBot Setup Wizard\n');
  console.log('This script will help you configure LanguageBot for deployment.\n');

  // Check if .env exists
  if (fs.existsSync('.env')) {
    const overwrite = await question('.env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }

  console.log('\n📝 Step 1: Google OAuth Configuration');
  console.log('Get your Client ID from: https://console.cloud.google.com/\n');

  const googleClientId = await question('Enter your Google Client ID: ');

  if (!googleClientId || googleClientId.trim() === '') {
    console.log('❌ Error: Google Client ID is required.');
    rl.close();
    return;
  }

  console.log('\n🔐 Step 2: Generating secure keys...');
  const sessionSecret = generateSecureKey();
  const encryptionKey = generateSecureKey();
  console.log('✅ Generated SESSION_SECRET');
  console.log('✅ Generated ENCRYPTION_KEY');

  console.log('\n🔑 Step 3: Gemini API Key (Optional)');
  console.log('This is optional. If not provided, users must enter their own API keys.\n');

  const geminiApiKey = await question('Enter Gemini API Key (press Enter to skip): ');

  console.log('\n🌐 Step 4: Application Configuration');
  const port = await question('Enter port number (default: 3000): ') || '3000';
  const nodeEnv = await question('Environment (development/production, default: development): ') || 'development';

  // Create .env file
  let envContent = `# LanguageBot Configuration
# Generated on ${new Date().toISOString()}

# Google OAuth Configuration
GOOGLE_CLIENT_ID=${googleClientId}

# Security Keys (DO NOT SHARE THESE)
SESSION_SECRET=${sessionSecret}
ENCRYPTION_KEY=${encryptionKey}

`;

  if (geminiApiKey && geminiApiKey.trim() !== '') {
    envContent += `# Gemini API Key (Fallback)
GEMINI_API_KEY=${geminiApiKey}

`;
  }

  envContent += `# Application Configuration
PORT=${port}
NODE_ENV=${nodeEnv}
`;

  fs.writeFileSync('.env', envContent);
  console.log('\n✅ Created .env file');

  // Create public/config.js
  const configContent = `// LanguageBot Frontend Configuration
// Generated on ${new Date().toISOString()}
window.APP_CONFIG = {
  GOOGLE_CLIENT_ID: '${googleClientId}'
};
`;

  fs.writeFileSync('public/config.js', configContent);
  console.log('✅ Created public/config.js');

  console.log('\n✨ Setup complete!\n');
  console.log('Next steps:');
  console.log('1. Review the .env file');
  console.log('2. Start the server: node index.js');
  console.log('3. Visit http://localhost:' + port);
  console.log('\n📚 For more information, see DEPLOYMENT.md\n');

  rl.close();
}

// Run setup
setup().catch(err => {
  console.error('Error during setup:', err);
  rl.close();
  process.exit(1);
});
