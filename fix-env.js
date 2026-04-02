const fs = require('fs');

try {
  const content = fs.readFileSync('.env', 'utf8');
  let geminiKey = '';
  
  // Try to find the gemini key, even if it's messed up
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.includes('VITE_GEMINI_API_KEY')) {
      geminiKey = line.split('=')[1]?.trim() || '';
    }
  }

  const fixedEnv = `VITE_GEMINI_API_KEY=${geminiKey}
VITE_FIREBASE_API_KEY=AIzaSyBCNOksu4UOTY_PNAfDjtiyA5UDVsNSqjo
VITE_FIREBASE_AUTH_DOMAIN=fitforge-a2be9.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fitforge-a2be9
VITE_FIREBASE_STORAGE_BUCKET=fitforge-a2be9.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=831590799637
VITE_FIREBASE_APP_ID=1:831590799637:web:ce88fa277314f13ec0311c
VITE_FIREBASE_MEASUREMENT_ID=G-1XR3M7TLM2
`;

  fs.writeFileSync('.env', fixedEnv);
  console.log("Successfully rebuilt .env file with correct dotenv syntax!");
} catch(e) {
  console.error("Failed to read/write .env file", e);
}
