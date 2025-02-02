import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, useParams, useNavigate } from 'react-router-dom';
import Map from '@/components/Map';
import axios from 'axios';
import AlertList from '@/components/AlertList';
import AlertDetails from '@/components/AlertDetails';
import { AlertType } from '@/types/alerts';
import { LanguageProvider } from './LanguageContext';
import { LanguageContext } from './LanguageContext';

const Index = () => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
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
        })
        .catch((err) => console.error("Error fetching alerts:", err));
    }
  }, [languageContext?.isArabic]);

  const handleAlertSelect = (alert: AlertType) => {
    navigate(`/alert/${alert.id}`);
  };

  if (!languageContext) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="pl-80 pr-0 mt-3">
        <div className="p-6">
          <div className="flex justify-between items-center pr-10">
            <h3 className="text-black">hi</h3>
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
          <Map alerts={alerts} midpoint={midpoint} onAlertSelect={handleAlertSelect} />
        </div>
      </div>
      <AlertList alerts={alerts} onAlertSelect={handleAlertSelect} />
    </div>
  );
};
// const Index = () => {
//   const [alerts, setAlerts] = useState<AlertType[]>([]);
//   const [midpoint, setMidpoint] = useState<[number, number]>([40.7128, -74.006]);
//   const [isArabic, setIsArabic] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     axios
//       .get(`http://127.0.0.1:8000/api/alerts_with_midpoint?lang=${isArabic ? 'ar' : 'en'}`)
//       .then((res) => {
//         setAlerts(res.data.alerts);
//         setMidpoint(res.data.midpoint);
//       })
//       .catch((err) => console.error("Error fetching alerts:", err));
//   }, []);

//   const handleAlertSelect = (alert: AlertType) => {
//     navigate(`/alert/${alert.id}`);
//   };

//   return (
//     <div className="h-screen w-full overflow-hidden bg-background text-foreground">
//       <div className="pl-80 pr-0 mt-3 ">
//         <div className="p-6">
//           <div className="flex justify-between items-center pr-10">
//             <h3 className="text-black">hi</h3>
//           <button
//           onClick={() => setIsArabic(!isArabic)}
//           variant="outline"
//           className={`rounded-full p-3 ' ${
//             isArabic 
//               ? 'bg-red-600/20 hover:bg-red-600/20 text-red-500 hover:text-red-500'
//               : 'bg-green-600/20 hover:bg-green-600/20 text-green-500 hover:text-green-500' 
//           }`}
//         >
//           {isArabic ? 'English' : 'Arabic'}
//         </button>
//           </div>
//           <br></br>
//           <Map
//             alerts={alerts}
//             midpoint={midpoint}
//             onAlertSelect={handleAlertSelect}
//           />
//         </div>
//       </div>
//       <AlertList alerts={alerts} onAlertSelect={handleAlertSelect} />
//     </div>
//   );
// };

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
      </Routes>
    </Router>
    </LanguageProvider>
  );
};

export default App;