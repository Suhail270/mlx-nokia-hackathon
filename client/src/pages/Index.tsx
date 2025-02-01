import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useParams, useNavigate } from 'react-router-dom';
import Map from '@/components/Map';
import axios from 'axios';
import AlertList from '@/components/AlertList';
import AlertDetails from '@/components/AlertDetails';
import { AlertType } from '@/types/alerts';

const Index = () => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [midpoint, setMidpoint] = useState<[number, number]>([40.7128, -74.006]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/alerts_with_midpoint")
      .then((res) => {
        setAlerts(res.data.alerts);
        setMidpoint(res.data.midpoint);
      })
      .catch((err) => console.error("Error fetching alerts:", err));
  }, []);

  const handleAlertSelect = (alert: AlertType) => {
    navigate(`/alert/${alert.id}`);
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-background text-foreground">
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
    </div>
  );
};

const AlertDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [alert, setAlert] = useState<AlertType | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/alerts/${id}`)
      .then((res) => {
        setAlert(res.data);
      })
      .catch((err) => console.error("Error fetching alert details:", err));

    // to send data to vector store
    axios
      .get(`http://127.0.0.1:8000/api/vectorstore/${id}`)
      .then((res) => {
        console.log("Vector store created:", res.data.message);
      })
      .catch((err) => {
        console.error("Error sending id to vector store:", err);
      });

  }, [id]);

  const handleBack = () => {
    navigate('/');
  };

  if (!alert) {
    return <div>Loading...</div>;
  }

  return (
    <AlertDetails alert={alert} onBack={handleBack} />
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/alert/:id" element={<AlertDetailPage />} />
      </Routes>
    </Router>
  );
};

export default App;