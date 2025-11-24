// firebaseAdmin.js
import fs from "fs";
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correct path to your service account key
const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");

// Read and parse the JSON key
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Get Firestore database reference
const db = admin.firestore();

// Export both admin and db as named exports
export { admin, db };
