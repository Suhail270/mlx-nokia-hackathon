import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, useParams, useNavigate } from 'react-router-dom';
import Map from '@/components/Map';
import axios from 'axios';
import AlertList from '@/components/AlertList';
import AlertDetails from '@/components/AlertDetails';
import { AlertType, PoliceType, AmbulanceType, DroneType, FirefighterType } from '@/types/alerts';
import { LanguageProvider } from '@/pages/LanguageContext';
import { LanguageContext } from '@/pages/LanguageContext';
import ReportPage from '@/components/Report';  

const Index = () => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [policeData, setPolice] = useState<PoliceType[]>([]);
  const [ambulanceData, setAmbulance] = useState<AmbulanceType[]>([]);
  const [ffData, setFf] = useState<FirefighterType[]>([]);
  const [droneData, setDrone] = useState<DroneType[]>([]);
  const [midpoint, setMidpoint] = useState<[number, number]>([40.7128, -74.006]);
  const navigate = useNavigate();
  const languageContext = useContext(LanguageContext);

  useEffect(() => {
    if (languageContext) {
      axios
        .get(`http://127.0.0.1:8000/api/alerts_with_midpoint?lang=${languageContext.isArabic ? 'ar' : 'en'}`)
        .then((res) => {
          setAlerts(res.data.alerts);
          setMidpoint(res.data.midpoint);
          setPolice(res.data.police);
          setAmbulance(res.data.ambulance);
          setFf(res.data.firefighter);
          setDrone(res.data.drone);
        })
        .catch((err) => console.error("Error fetching alerts:", err));
    }
  }, [languageContext?.isArabic]);

  const handleAlertSelect = (alert: AlertType) => {
    navigate(`/alert/${alert.id}`);
  };

  // Add a handler to navigate to the Report page
  const handleReportClick = () => {
    navigate('/report');
  };

  if (!languageContext) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="hidden sm:block pl-80 pr-0">
        <div className="p-6">
          <div className="flex justify-between items-center pr-10">
            <button 
              onClick={handleReportClick}
              className='rounded-full p-3 bg-yellow-600/20 hover:bg-yellow-600/20 text-yellow-500 hover:text-yellow-500'
              >
                Report
              </button>
            <button
              onClick={languageContext.toggleLanguage}
              className={`rounded-full p-3 ${
                languageContext.isArabic
                  ? 'bg-red-600/20 hover:bg-red-600/20 text-red-500 hover:text-red-500'
                  : 'bg-green-600/20 hover:bg-green-600/20 text-green-500 hover:text-green-500'
              }`}
            >
              {languageContext.isArabic ? 'English' : 'Arabic'}
            </button>
          </div>
          <br />
          <Map alerts={alerts} policeZones={policeData} ambulanceZones={ambulanceData} firefighterZones={ffData} droneZone={droneData}  midpoint={midpoint} onAlertSelect={handleAlertSelect} />
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
  const languageContext = useContext(LanguageContext);

  useEffect(() => {
    if (languageContext) {
      axios
        .get(`http://127.0.0.1:8000/api/alerts/${id}?lang=${languageContext.isArabic ? 'ar' : 'en'}`)
        .then((res) => {
          setAlert(res.data);
        })
        .catch((err) => console.error("Error fetching alert details:", err));

      axios
        .get(`http://127.0.0.1:8000/api/vectorstore/${id}?lang=${languageContext.isArabic ? 'ar' : 'en'}`)
        .then((res) => {
          console.log("Vector store created:", res.data.message);
        })
        .catch((err) => {
          console.error("Error sending id to vector store:", err);
        });

      axios
        .get(`http://127.0.0.1:8000/api/summary/${id}?lang=${languageContext.isArabic ? 'ar' : 'en'}`)
        .then((res) => {
          console.log("Summary created:", res.data.message);
        })
        .catch((err) => {
          console.error("Error sending id to summary:", err);
        });
    }
  }, [id, languageContext?.isArabic]);

  const handleBack = () => {
    navigate('/');
  };

  if (!alert) {
    return <div>Loading...</div>;
  }

  return <AlertDetails alert={alert} onBack={handleBack} />;
};

// const AlertDetailPage = () => {
//   const { id } = useParams<{ id: string }>();
//   const [alert, setAlert] = useState<AlertType | null>(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     axios
//       // .get(`http://127.0.0.1:8000/api/alerts/${id}`)
//       .get(`http://127.0.0.1:8000/api/alerts/${id}?lang=${isArabic ? 'ar' : 'en'}`)
//       .then((res) => {
//         setAlert(res.data);
//       })
//       .catch((err) => console.error("Error fetching alert details:", err));

//     // to send data to vector store
//     axios
//       .get(`http://127.0.0.1:8000/api/vectorstore/${id}?lang=${isArabic ? 'ar' : 'en'}`)
//       .then((res) => {
//         console.log("Vector store created:", res.data.message);
//       })
//       .catch((err) => {
//         console.error("Error sending id to vector store:", err);
//       });

//     axios
//       .get(`http://127.0.0.1:8000/api/summary/${id}?lang=${isArabic ? 'ar' : 'en'}`)
//       .then((res) => {
//         console.log("Summary created:", res.data.message);
//       })
//       .catch((err) => {
//         console.error("Error sending id to summary:", err);
//       });

//   }, [id]);

//   const handleBack = () => {
//     navigate('/');
//   };

//   if (!alert) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <AlertDetails alert={alert} onBack={handleBack} />
//   );
// };

const App = () => {
  return (
    <LanguageProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/alert/:id" element={<AlertDetailPage />} />
        <Route path="/report" element={<ReportPage />} /> 
      </Routes>
    </Router>
    </LanguageProvider>
  );
};

export default App;