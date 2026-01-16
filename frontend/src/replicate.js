const admin = require("firebase-admin");
const fs = require("fs");

// Load service accounts
console.log("Loading service accounts...");

// SOURCE → Project A (carepulse-52b2a)
const serviceAccountA = JSON.parse(
  fs.readFileSync("./adminsdk1.json", "utf8")
);

// DESTINATION → Project B (carepulse-ccfba)
const serviceAccountB = JSON.parse(
  fs.readFileSync("./adminsdk.json", "utf8")
);

console.log("Service accounts loaded");

// Initialize Project A (SOURCE)
console.log("Initializing Project A (SOURCE)...");
const appA = admin.initializeApp(
  { credential: admin.credential.cert(serviceAccountA) },
  "AppA"
);
const dbA = appA.firestore();
console.log("Project A initialized");

// Initialize Project B (DESTINATION)
console.log("Initializing Project B (DESTINATION)...");
const appB = admin.initializeApp(
  { credential: admin.credential.cert(serviceAccountB) },
  "AppB"
);
const dbB = appB.firestore();
console.log("Project B initialized");

// Replicate a single document
async function replicateDocument(path, data) {
  console.log("Replicating:", path);
  try {
    await dbB.doc(path).set(data, { merge: true });
    console.log("Replicated:", path);
  } catch (err) {
    console.error("Error replicating", path, err);
  }
}

// Delete a document
async function deleteDocument(path) {
  console.log("Deleting:", path);
  try {
    await dbB.doc(path).delete();
    console.log("Deleted:", path);
  } catch (err) {
    console.error("Error deleting", path, err);
  }
}

// Initial full sync of all existing documents
async function fullSync(colRef) {
  const colName = colRef.id;

  console.log(`Performing full sync for collection: ${colName}...`);

  const snapshot = await colRef.get();
  if (snapshot.empty) {
    console.log(`Collection ${colName} is empty.`);
    return;
  }

  for (const doc of snapshot.docs) {
    const docPath = `${colName}/${doc.id}`;
    await replicateDocument(docPath, doc.data());
  }

  console.log(`Full sync completed for collection: ${colName}`);
}

// Start replication
async function startReplication() {
  console.log("Fetching collections from SOURCE (Project A)...");
  const collections = await dbA.listCollections();
  const colNames = collections.map(c => c.id);
  console.log("Collections found in A (SOURCE):", colNames);

  if (collections.length === 0) {
    console.log("No collections found in Project A (SOURCE). Nothing to replicate.");
    return;
  }

  for (const col of collections) {
    const colName = col.id;

    // Initial full sync
    await fullSync(col);

    // Real-time listener
    console.log(`Listening for live changes in collection: ${colName}`);

    col.onSnapshot(snapshot => {
      console.log(`Change detected in: ${colName}`);

      snapshot.docChanges().forEach(change => {
        const docPath = `${colName}/${change.doc.id}`;

        if (change.type === "added" || change.type === "modified") {
          replicateDocument(docPath, change.doc.data());
        }

        if (change.type === "removed") {
          deleteDocument(docPath);
        }
      });
    });
  }
}

startReplication();
console.log("Replication service started. Waiting for changes...");
