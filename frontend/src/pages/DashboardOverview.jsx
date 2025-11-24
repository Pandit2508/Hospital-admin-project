import React from "react";
import useHospitalResources from "../hooks/useHospitalResources";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";

export default function DashboardOverview({ hospitalId }) {
  const { resources, loading } = useHospitalResources(hospitalId);

  if (loading) return <p>Loading data...</p>;
  if (!resources) return <p>No resource data found.</p>;

  /* ---- Safe fallback values ---- */
  const beds = resources.beds || { total: 0, occupied: 0 };
  const icuBeds = resources.icuBeds || { total: 0, occupied: 0 };
  const ventilators = resources.ventilators || { total: 0, occupied: 0 };
  const bloodBank = resources.bloodBank || {};

  /* ---- FIX: Oxygen cylinders can be number OR object ---- */
  let oxygenValue = 0;
  if (typeof resources.oxygenCylinders === "number") {
    oxygenValue = resources.oxygenCylinders;
  } else if (resources.oxygenCylinders?.available != null) {
    oxygenValue = resources.oxygenCylinders.available;
  }

  /* ---- FIX: Ambulance active must never exceed total ---- */
  const ambulances = resources.ambulances || {
    total: 0,
    active: 0,
    maintenance: 0,
  };

  const safeActive = Math.min(ambulances.active || 0, ambulances.total || 0);
  const safeMaintenance =
    ambulances.maintenance > ambulances.total
      ? ambulances.total - safeActive
      : ambulances.maintenance || 0;

  /* ---- Dashboard Stats ---- */
  const stats = [
    {
      label: "Total Beds",
      value: Math.max(0,beds.total - beds.occupied),
      available: Math.max(0,beds.total - beds.occupied),
      icon: "🛏️",
    },
    {
      label: "ICU Beds",
      value: Math.max(0,icuBeds.total - icuBeds.occupied),
      available: Math.max(0,icuBeds.total - icuBeds.occupied),
      icon: "⚕️",
    },
    {
      label: "Ventilators",
      value: Math.max(0,ventilators.total - ventilators.occupied),
      available: Math.max(0,ventilators.total - ventilators.occupied),
      icon: "🫁",
    },
    {
      label: "Blood Units",
      value: Object.values(bloodBank || {}).reduce(
        (a, b) => a + (b || 0),
        0
      ),
      critical: Object.values(bloodBank || {}).filter(
        (v) => (v || 0) < 20
      ).length,
      icon: "💉",
    },
    {
  label: "Oxygen Cylinders",
  value:oxygenValue ?? 0,
  available: oxygenValue ?? 0,
  icon: "🧪",
},
    {
      label: "Ambulances",
      value: safeActive || 0,
      active: safeActive,
      maintenance: safeMaintenance,
      icon: "🚑",
    },
  ];

  /* ---- Blood Bank Groups ---- */
  const bloodGroupsArray = Object.entries(bloodBank || {}).map(
    ([group, units]) => ({
      group,
      units,
      status:
        units === 0 ? "Critical" : units < 20 ? "Low" : "Good",
    })
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Stats Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="flex justify-between">
                {stat.label}
                <span className="text-2xl">{stat.icon}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stat.value}
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                {"occupied" in stat && <p>Occupied: {stat.occupied}</p>}
                {"available" in stat && <p>Available: {stat.available}</p>}
                {"critical" in stat && <p>Critical Groups: {stat.critical}</p>}

                {"active" in stat && <p>Active: {stat.active}</p>}
                {"maintenance" in stat && (
                  <p>Maintenance: {stat.maintenance}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Blood Bank Status */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Bank Status</CardTitle>
          <CardDescription>Live inventory</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bloodGroupsArray.length === 0 ? (
              <p className="text-gray-600">No blood data available.</p>
            ) : (
              bloodGroupsArray.map((b, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="text-lg font-bold">{b.group}</div>
                  <div className="text-2xl font-bold">{b.units}</div>

                  <div
                    className={`text-xs mt-2 ${
                      b.status === "Critical"
                        ? "text-red-600"
                        : b.status === "Low"
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {b.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
