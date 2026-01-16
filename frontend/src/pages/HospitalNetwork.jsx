"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, MapPin, Phone, Mail } from "lucide-react";

import { db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function HospitalNetwork({ hospitalId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterResource, setFilterResource] = useState("all");
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // FETCH ALL HOSPITALS EXCEPT CURRENT ONE
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const hospitalsCol = await getDocs(collection(db, "hospitals"));
        const hospitalList = [];

        for (const hospitalDoc of hospitalsCol.docs) {
          const otherId = hospitalDoc.id;

          // Don't show own hospital
          if (otherId === hospitalId) continue;

          const hospitalData = hospitalDoc.data();

          const resolvedName =
            hospitalData.name ||
            hospitalData.hospitalName ||
            hospitalData.HospitalName ||
            hospitalData.Name ||
            "Unnamed Hospital";

          // Fetch resource info
          const resourceRef = doc(
            db,
            "hospitals",
            otherId,
            "resources",
            "resourceInfo"
          );

          const resourceSnap = await getDoc(resourceRef);

          const defaultResources = {
            beds: { total: 0, occupied: 0 },
            icuBeds: { total: 0, occupied: 0 },
            ventilators: { total: 0, occupied: 0 },
            oxygenCylinders: { available: 0 },
            ambulances: { total: 0, active: 0, maintenance: 0 },
            bloodBank: {},
          };

          const resources = resourceSnap.exists()
            ? { ...defaultResources, ...resourceSnap.data() }
            : defaultResources;

          hospitalList.push({
            id: otherId,
            name: resolvedName,
            location: hospitalData.location || "No location",
            contact: hospitalData.contact || "N/A",
            email: hospitalData.email || "N/A",
            resources,
          });
        }

        setHospitals(hospitalList);
      } catch (err) {
        console.error("Error loading hospitals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [hospitalId]);

  // FILTERING LOGIC
  const filteredHospitals = hospitals.filter((hospital) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      hospital.name?.toLowerCase().includes(term) ||
      hospital.location?.toLowerCase().includes(term);

    const r = hospital.resources;

    const bedsAvailable = (r.beds.total || 0) - (r.beds.occupied || 0);
    const icuAvailable = (r.icuBeds.total || 0) - (r.icuBeds.occupied || 0);
    const ventilatorsAvailable =
      (r.ventilators.total || 0) - (r.ventilators.occupied || 0);
    const oxygenAvailable = r.oxygenCylinders.available || 0;
    const ambulancesAvailable =
      (r.ambulances.total || 0) - (r.ambualnces?.maintenance || 0);

    const matchesFilter =
      filterResource === "all" ||
      (filterResource === "beds" && bedsAvailable > 0) ||
      (filterResource === "icu" && icuAvailable > 0) ||
      (filterResource === "ventilators" && ventilatorsAvailable > 0) ||
      (filterResource === "oxygen" && oxygenAvailable > 0) ||
      (filterResource === "ambulances" && ambulancesAvailable > 0);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-400 text-lg">
        Loading hospital data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Hospital Network</h1>
      <p className="text-gray-600">
        View and refer patients to nearby hospitals
      </p>

      {/* SEARCH + FILTER */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search hospital or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={filterResource}
              onChange={(e) => setFilterResource(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Resources</option>
              <option value="beds">Available Beds</option>
              <option value="icu">ICU Beds</option>
              <option value="ventilators">Ventilators</option>
              <option value="oxygen">Oxygen Cylinders</option>
              <option value="ambulances">Ambulances</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* HOSPITAL LIST */}
      <div className="grid grid-cols-1 gap-4">
        {filteredHospitals.map((hospital) => {
          const r = hospital.resources;

          const bedsAvailable = (r.beds.total || 0) - (r.beds.occupied || 0);
          const icuAvailable = (r.icuBeds.total || 0) - (r.icuBeds.occupied || 0);
          const ventilatorsAvailable =
            (r.ventilators.total || 0) - (r.ventilators.occupied || 0);
          const oxygenAvailable = r.oxygenCylinders.available || 0;
          const ambulancesAvailable =
            (r.ambulances.total || 0) - (r.ambulances.maintenance || 0);

          return (
            <Card
              key={hospital.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Info */}
                  <div>
                    <h3 className="text-lg font-bold">{hospital.name}</h3>

                    <div className="space-y-2 mt-3 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {hospital.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {hospital.contact}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {hospital.email}
                      </div>
                    </div>
                  </div>

                  {/* Resources */}
                  <div className="grid grid-cols-3 gap-3">
                    <ResourceCard label="Beds" value={bedsAvailable} total={r.beds.total} />
                    <ResourceCard label="ICU" value={icuAvailable} total={r.icuBeds.total} />
                    <ResourceCard label="Ventilators" value={ventilatorsAvailable} total={r.ventilators.total} />
                    <ResourceCard label="Oxygen" value={oxygenAvailable} total={r.oxygenCylinders.available} />
                    <ResourceCard label="Ambulances" value={ambulancesAvailable} total={r.ambulances.total} />

                    {bloodGroups.map((group) => (
                      <ResourceCard
                        key={group}
                        label={`Blood ${group}`}
                        value={r.bloodBank[group] || 0}
                        total={r.bloodBank[group] || 0}
                      />
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col justify-center gap-2">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() =>
                        navigate(`/refer-patient/${hospital.id}`)
                      }
                    >
                      Refer Patient
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ResourceCard({ label, value, total }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg text-center">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-500">of {total || 0}</div>
    </div>
  );
}
