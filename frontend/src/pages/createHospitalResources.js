import { doc, setDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

export async function createHospitalResource(hospitalId, resourceId, data) {
  const ref = doc(collection(db, "hospitals", hospitalId, "resources"), resourceId);

  await setDoc(ref, data, { merge: true });
}
