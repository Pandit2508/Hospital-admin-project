const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// -----------------------------
// Load Service Accounts
// -----------------------------
console.log("➡ Loading service accounts...");

// Adjusted paths based on your folder structure
const serviceAccountA = JSON.parse(
  fs.readFileSync(path.join(__dirname, "seed/adminsdk1.json"), "utf8")
);

const serviceAccountB = JSON.parse(
  fs.readFileSync(path.join(__dirname, "seed/adminsdk.json"), "utf8")
);

console.log("✔ Service accounts loaded");

// -----------------------------
// Initialize FIREBASE PROJECT A (SOURCE)
// -----------------------------
console.log("➡ Initializing SOURCE Project (A)...");

const appA = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccountA),
  },
  "AppA"
);

const dbA = appA.firestore();

console.log("✔ Project A initialized");

// -----------------------------
// Initialize FIREBASE PROJECT B (DESTINATION)
// -----------------------------
console.log("➡ Initializing DESTINATION Project (B)...");

const appB = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccountB),
  },
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
    console.error("❌ Copy error", path, err);
  }
}

// -----------------------------
// Recursively copy collections
// -----------------------------
async function copyCollectionRecursively(sourceRef, destPath = "") {
  const snapshot = await sourceRef.get();

  for (const doc of snapshot.docs) {
    const fullPath = destPath ? `${destPath}/${doc.id}` : doc.id;

    // Copy doc data
    await copyDocument(fullPath, doc.data());

    // Copy ALL subcollections
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

// -----------------------------
// Start replication (FULL COPY ONLY)
// -----------------------------
fullSync();
