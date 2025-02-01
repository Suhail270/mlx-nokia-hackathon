import React, { useState, useEffect } from 'react';  
import Map from '@/components/Map';
import axios from 'axios';
import AlertList from '@/components/AlertList';
import AlertDetails from '@/components/AlertDetails';
import { AlertType } from '@/types/alerts';

// Mock alerts
const mockAlerts: AlertType[] = [
  {
    id: '1',
    type: 'fire',
    severity: 'critical',
    location: '123 Main St, New York, NY',
    latitude: 40.7128,
    longitude: -74.006,
    timestamp: new Date().toISOString(),
    description: 'Large fire detected in residential building. Multiple heat signatures detected. Large fire detected in residential building. Multiple heat signatures detected. Large fire detected in residential building. Multiple heat signatures detected.',
    image: '@/images/fire.png',
  },
  {
    id: '2',
    type: 'assault',
    severity: 'warning',
    location: '456 Park Ave, New York, NY',
    latitude: 40.7528,
    longitude: -73.9765,
    timestamp: new Date().toISOString(),
    description: 'Potential assault detected in parking garage. Two individuals involved.',
    image: '@/images/fire.png',
  },
];

const Index = () => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertType | null>(null);

  // ✅ Fetch Alerts from FastAPI (SQLite)
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/alerts")
      .then(res => setAlerts(res.data))
      .catch(err => console.error("Error fetching alerts:", err));
  }, []);

  const handleAlertSelect = (alert: AlertType) => {
    setSelectedAlert(alert);
  };

  const handleBack = () => {
    setSelectedAlert(null);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
      {selectedAlert ? (
        // Show AlertDetails if an alert is selected
        <AlertDetails alert={selectedAlert} onBack={handleBack} />
      ) : (
        // Show Map and Alert List when no alert is selected
        <>
          <div className="pl-80 pr-0">
            <div className="p-6">
              <Map alerts={alerts} onAlertSelect={handleAlertSelect} />
            </div>
          </div>
          <AlertList alerts={alerts} onAlertSelect={handleAlertSelect} />
        </>
      )}
    </div>
  );
};

export default Index;
