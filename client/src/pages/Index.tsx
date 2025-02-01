import React, { useState, useEffect } from 'react';
import Map from '@/components/Map';
import axios from 'axios';
import AlertList from '@/components/AlertList';
import AlertDetails from '@/components/AlertDetails';
import { AlertType } from '@/types/alerts';

const Index = () => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  // Default midpoint is set to NYC coordinates in case the backend call fails or hasn't returned yet
  const [midpoint, setMidpoint] = useState<[number, number]>([40.7128, -74.006]);
  const [selectedAlert, setSelectedAlert] = useState<AlertType | null>(null);

  // ✅ Fetch Alerts and Midpoint from FastAPI (SQLite)
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/alerts_with_midpoint")
      .then((res) => {
        // Assuming the backend returns { alerts: AlertType[], midpoint: [number, number] }
        setAlerts(res.data.alerts);
        setMidpoint(res.data.midpoint);
      })
      .catch((err) => console.error("Error fetching alerts:", err));
  }, []);

  const handleAlertSelect = (alert: AlertType) => {
    setSelectedAlert(alert);
  };

  const handleBack = () => {
    setSelectedAlert(null);
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-background text-foreground">
      {selectedAlert ? (
        // Show AlertDetails if an alert is selected
        <AlertDetails alert={selectedAlert} onBack={handleBack} />
      ) : (
        // Show Map and Alert List when no alert is selected
        <>
          <div className="pl-80 pr-0">
            <div className="p-6">
              <Map
                alerts={alerts}
                midpoint={midpoint}
                onAlertSelect={handleAlertSelect}
              />
            </div>
          </div>
          <AlertList alerts={alerts} onAlertSelect={handleAlertSelect} />
        </>
      )}
    </div>
  );
};

export default Index;
