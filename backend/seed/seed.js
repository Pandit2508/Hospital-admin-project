import { admin, db } from "./firebaseAdmin.js";
import { patientNames } from "./patientNames.js";

// Example hospitals
const hospitals = [
  { id: "HOSP1", name: "AIIMS Delhi", city: "Delhi" },
  { id: "HOSP2", name: "Fortis Noida", city: "Noida" },
  { id: "HOSP3", name: "Yashoda Ghaziabad", city: "Ghaziabad" },
  { id: "HOSP4", name: "Max Saket", city: "Delhi" },
  { id: "HOSP5", name: "Apollo Noida", city: "Noida" },
  { id: "HOSP6", name: "GTB Hospital", city: "Delhi" },
  { id: "HOSP7", name: "Jaypee Hospital", city: "Noida" },
  { id: "HOSP8", name: "Columbia Asia", city: "Ghaziabad" },
  { id: "HOSP9", name: "BLK Hospital", city: "Delhi" },
  { id: "HOSP10", name: "Metro Hospital", city: "Noida" }
];

const diseases = [
  "Fever", "Diabetes", "Asthma", "Heart Issue", "Fracture", "Infection", "Liver Issue"
];

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedHospitals() {
  let patientIndex = 0;

  for (const hospital of hospitals) {
    const patientCount = getRandom(2, 15);
    const patients = [];

    for (let i = 0; i < patientCount; i++) {
      const name = patientNames[patientIndex++];

      patients.push({
        patientId: `P${patientIndex}`,
        hospitalId: hospital.id,
        name,
        age: getRandom(18, 70),
        disease: diseases[getRandom(0, diseases.length - 1)],
        admittedOn: new Date().toISOString(),
        status: Math.random() > 0.5 ? "Admitted" : "Discharged"
      });
    }

    await db.collection("hospitals").doc(hospital.id).set({
      hospitalId: hospital.id,
      name: hospital.name,
      city: hospital.city,
      createdAt: new Date().toISOString(),
      patients
    });

    console.log(`✔ Added ${patients.length} patients to ${hospital.id}`);
  }

  console.log("\n🔥 Seeding complete!");
}

seedHospitals().catch(console.error);
