require("dotenv").config({ path: __dirname + "/replicate.env" });
const admin = require("firebase-admin");

// -----------------------------
// Build Service Account A (SOURCE PROJECT)
// -----------------------------
const serviceAccountA = {
  type: process.env.A_TYPE,
  project_id: process.env.A_PROJECT_ID,
  private_key_id: process.env.A_PRIVATE_KEY_ID,
  private_key: process.env.A_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.A_CLIENT_EMAIL,
  client_id: process.env.A_CLIENT_ID,
  auth_uri: process.env.A_AUTH_URI,
  token_uri: process.env.A_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.A_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.A_CLIENT_CERT_URL,
};

// -----------------------------
// Build Service Account B (DESTINATION PROJECT)
// -----------------------------
const serviceAccountB = {
  type: process.env.B_TYPE,
  project_id: process.env.B_PROJECT_ID,
  private_key_id: process.env.B_PRIVATE_KEY_ID,
  private_key: process.env.B_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.B_CLIENT_EMAIL,
  client_id: process.env.B_CLIENT_ID,
  auth_uri: process.env.B_AUTH_URI,
  token_uri: process.env.B_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.B_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.B_CLIENT_CERT_URL,
};

console.log("✔ Loaded service accounts from replicate.env");

// -----------------------------
// Initialize FIREBASE PROJECT A (SOURCE)
// -----------------------------
console.log("➡ Initializing SOURCE Project A...");
const appA = admin.initializeApp(
  { credential: admin.credential.cert(serviceAccountA) },
  "AppA"
);
const dbA = appA.firestore();
console.log("✔ Project A initialized");

// -----------------------------
// Initialize FIREBASE PROJECT B (DESTINATION)
// -----------------------------
console.log("➡ Initializing DESTINATION Project B...");
const appB = admin.initializeApp(
  { credential: admin.credential.cert(serviceAccountB) },
  "AppB"
);
const dbB = appB.firestore();
console.log("✔ Project B initialized");

// -----------------------------
// Copy one document
// -----------------------------
async function copyDocument(path, data) {
  try {
    await dbB.doc(path).set(data, { merge: true });
    console.log("✔ Copied:", path);
  } catch (err) {
    console.error("❌ Error copying", path, err);
  }
}

// -----------------------------
// Recursively copy collections
// -----------------------------
async function copyCollectionRecursively(sourceRef, destPath = "") {
  const snapshot = await sourceRef.get();

  for (const doc of snapshot.docs) {
    const fullPath = destPath ? `${destPath}/${doc.id}` : doc.id;

    await copyDocument(fullPath, doc.data());

    const subcollections = await doc.ref.listCollections();

    for (const sub of subcollections) {
      await copyCollectionRecursively(sub, `${fullPath}/${sub.id}`);
    }
  }
}

// -----------------------------
// Full Database Sync
// -----------------------------
async function fullSync() {
  console.log("🔄 Starting FULL REPLICATION...");

  const rootCollections = await dbA.listCollections();

  for (const col of rootCollections) {
    console.log(`➡ Syncing collection: ${col.id}`);
    await copyCollectionRecursively(col, col.id);
  }

  console.log("🎉 FULL REPLICATION COMPLETED!");
}

fullSync();
