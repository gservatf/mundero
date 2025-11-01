import fs from "fs";
const envPath = ".env.production.local";
const content = fs.readFileSync(envPath, "utf8");

if (content.includes("your_firebase_api_key_here")) {
  console.warn(
    "⚠️ Detected placeholder environment file. Replacing with secured values...",
  );
  const secureEnv = `
VITE_FIREBASE_API_KEY=${process.env.VITE_FIREBASE_API_KEY || "AIzaSyAYsFOjM7B8nCOd2kyAaR5Qy5mDBHMajXU"}
VITE_FIREBASE_AUTH_DOMAIN=${process.env.VITE_FIREBASE_AUTH_DOMAIN || "legality360pro.firebaseapp.com"}
VITE_FIREBASE_PROJECT_ID=${process.env.VITE_FIREBASE_PROJECT_ID || "legality360pro"}
VITE_FIREBASE_STORAGE_BUCKET=${process.env.VITE_FIREBASE_STORAGE_BUCKET || "legality360pro.appspot.com"}
VITE_FIREBASE_MESSAGING_SENDER_ID=${process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "984302716980"}
VITE_FIREBASE_APP_ID=${process.env.VITE_FIREBASE_APP_ID || "1:984302716980:web:6b1e90b2d71a478a6c4b3b"}
VITE_SUPABASE_URL=${process.env.VITE_SUPABASE_URL || "https://vnfnlsjsnwyripsimlmg.supabase.co"}
VITE_SUPABASE_ANON_KEY=${process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZm5sc2pzbnd5cmlwc2ltbG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MjU4MzAsImV4cCI6MjA3NjAwMTgzMH0.Cr_AIl0SIJtyuuZrDtuQrgryMvdBTRTf4jANVp_OR7o"}
VITE_APP_NAME=MUNDERO
VITE_APP_VERSION=1.1.0
`;
  fs.writeFileSync(envPath, secureEnv);
  console.log("✅ Environment restored and locked.");
} else {
  console.log("🔒 Environment already secure.");
}
