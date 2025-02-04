// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Button } from '@/components/ui/button';

// interface ReportData {
//   alerts: any[];
//   ambulances: any[];
//   police: any[];
//   firefighters: any[];
//   drones: any[];
//   dispatches: any[];
// }

// const ReportPage = () => {
//   const navigate = useNavigate();

//   // "Back" button logic
//   const onBack = () => {
//     navigate('/');
//   };

//   // Dropdown states
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [selectedOption, setSelectedOption] = useState<string | null>(null);

//   // Custom days input state
//   const [customDays, setCustomDays] = useState('');

//   // Report data from the API
//   const [reportData, setReportData] = useState<ReportData | null>(null);

//   // Toggles the main dropdown
//   const toggleDropdown = () => {
//     setShowDropdown((prev) => !prev);
//   };

//   // Handles selecting an option from the dropdown
//   const handleSelectOption = (option: string) => {
//     setSelectedOption(option);
//     setShowDropdown(false);
//   };

//   // Handles the value of the custom days input
//   const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setCustomDays(e.target.value);
//   };

//   /**
//    * If the user has chosen a valid option ("Today", "Week", "Month", "Custom"),
//    * figure out the number of days and call the API
//    */
//   useEffect(() => {
//     if (!selectedOption) return; // No option selected yet, do nothing

//     let days = 0;
//     if (selectedOption === 'Today') {
//       days = 1;
//     } else if (selectedOption === 'Week') {
//       days = 7;
//     } else if (selectedOption === 'Month') {
//       days = 30;
//     } else if (selectedOption === 'Custom') {
//       // parse the customDays; default to 0 if invalid
//       const parsed = parseInt(customDays, 10);
//       if (parsed > 0) {
//         days = parsed;
//       } else {
//         // If custom is selected but user hasn't provided a valid number yet,
//         // we won't call the API
//         return;
//       }
//     }

//     // Now we can call the API with the `days` value
//     fetch(`http://localhost:8000/api/reports/json/${days}`)
//       .then((res) => {
//         if (!res.ok) {
//           throw new Error('Error fetching report data');
//         }
//         return res.json();
//       })
//       .then((data) => {
//         // data should contain:
//         // { alerts, ambulances, police, firefighters, drones, dispatches }
//         setReportData(data);
//       })
//       .catch((err) => {
//         console.error('Failed to fetch report data:', err);
//         setReportData(null);
//       });
//   }, [selectedOption, customDays]);

//   return (
//     <div className="bg-background w-full mt-5 pl-2 relative">
//       {/* A header bar with the back button, just like in AlertDetails */}
//       <div className="flex items-center justify-between ml-4">
//         <Button
//           variant="ghost"
//           className="flex items-center gap-2 hover:bg-transparent p-2"
//           onClick={onBack}
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="50"
//             height="50"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             className="transform scale-150"
//           >
//             <path d="M18 15h-6v4l-7-7 7-7v4h6v6z"/>
//           </svg>
//         </Button>
//       </div>

//       {/* Main Content */}
//       <div className="p-4 ml-5">
//         <h1 className="text-2xl font-bold mb-4 text-white">Report an Issue</h1>

//         {/* Dropdown Button */}
//         <div className="relative mb-4">
//           <Button
//             onClick={toggleDropdown}
//             className="bg-purple-400/80 text-white rounded px-4 py-2"
//           >
//             {selectedOption ? `Selected: ${selectedOption}` : 'Select Time Period'}
//           </Button>

//           {/* Dropdown Menu */}
//           {showDropdown && (
//             <div className="absolute bg-white rounded mt-2 shadow-lg w-48 text-black z-50">
//               <ul className="py-1">
//                 <li
//                   className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
//                   onClick={() => handleSelectOption('Today')}
//                 >
//                   Today
//                 </li>
//                 <li
//                   className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
//                   onClick={() => handleSelectOption('Week')}
//                 >
//                   Week
//                 </li>
//                 <li
//                   className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
//                   onClick={() => handleSelectOption('Month')}
//                 >
//                   Month
//                 </li>
//                 <li
//                   className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
//                   onClick={() => handleSelectOption('Custom')}
//                 >
//                   Custom
//                 </li>
//               </ul>
//             </div>
//           )}
//         </div>

//         {/* Show the "Custom" days input if user selected "Custom" */}
//         {selectedOption === 'Custom' && (
//           <div className="mb-4">
//             <label className="block text-white mb-2" htmlFor="customDays">
//               How many days?
//             </label>
//             <input
//               id="customDays"
//               type="number"
//               value={customDays}
//               onChange={handleDaysChange}
//               className="p-2 border border-gray-300 rounded focus:outline-none"
//               placeholder="e.g. 5"
//               min={1}
//             />
//           </div>
//         )}

//         {/* Display the fetched JSON data in tables, if we have it */}
//         {reportData && (
//           <div className="text-white space-y-6">
//             {/* Alerts Table */}
//             <div>
//               <h2 className="text-xl font-semibold mb-2">Alerts</h2>
//               <table className="min-w-full bg-gray-800 text-left border border-gray-700">
//                 <thead className="bg-gray-700">
//                   <tr>
//                     <th className="px-4 py-2 border-b border-gray-600">ID</th>
//                     <th className="px-4 py-2 border-b border-gray-600">Type</th>
//                     <th className="px-4 py-2 border-b border-gray-600">Severity</th>
//                     <th className="px-4 py-2 border-b border-gray-600">Location</th>
//                     <th className="px-4 py-2 border-b border-gray-600">Timestamp</th>
//                     <th className="px-4 py-2 border-b border-gray-600">Responder Type</th>
//                     <th className="px-4 py-2 border-b border-gray-600">Response Time</th>
//                     <th className="px-4 py-2 border-b border-gray-600">Resolution Time</th>
//                     <th className="px-4 py-2 border-b border-gray-600">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {reportData.alerts.map((alert) => (
//                     <tr key={alert.id} className="border-b border-gray-700">
//                       <td className="px-4 py-2">{alert.id}</td>
//                       <td className="px-4 py-2">{alert.type}</td>
//                       <td className="px-4 py-2">{alert.severity}</td>
//                       <td className="px-4 py-2">{alert.location}</td>
//                       <td className="px-4 py-2">{alert.timestamp}</td>
//                       <td className="px-4 py-2">{alert.responder_type}</td>
//                       <td className="px-4 py-2">{alert.response_time}</td>
//                       <td className="px-4 py-2">{alert.resolution_time}</td>
//                       <td className="px-4 py-2">{alert.status}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Ambulances Table */}
//             <div>
//               <h2 className="text-xl font-semibold mb-2">Ambulances</h2>
//               <table className="min-w-full bg-gray-800 text-left border border-gray-700">
//                 <thead className="bg-gray-700">
//                   <tr>
//                     <th className="px-4 py-2 border-b border-gray-600">ID</th>
//                     <th className="px-4 py-2 border-b border-gray-600">Zone</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {reportData.ambulances.map((ambulance) => (
//                     <tr key={ambulance.id} className="border-b border-gray-700">
//                       <td className="px-4 py-2">{ambulance.id}</td>
//                       <td className="px-4 py-2">{ambulance.zone}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Police Table */}
//             <div>
//               <h2 className="text-xl font-semibold mb-2">Police</h2>
//               <table className="min-w-full bg-gray-800 text-left border border-gray-700">
//                 <thead className="bg-gray-700">
//                   <tr>
//                     <th className="px-4 py-2 border-b border-gray-600">ID</th>
//                     <th className="px-4 py-2 border-b border-gray-600">Zone</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {reportData.police.map((policeman) => (
//                     <tr key={policeman.id} className="border-b border-gray-700">
//                       <td className="px-4 py-2">{policeman.id}</td>
//                       <td className="px-4 py-2">{policeman.zone}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Firefighters Table */}
//             <div>
//               <h2 className="text-xl font-semibold mb-2">Firefighters</h2>
//               <table className="min-w-full bg-gray-800 text-left border border-gray-700">
//                 <thead className="bg-gray-700">
//                   <tr>
//                     <th className="px-4 py-2 border-b border-gray-600">ID</th>
//                     <th className="px-4 py-2 border-b border-gray-600">Zone</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {reportData.firefighters.map((firefighter) => (
//                     <tr key={firefighter.id} className="border-b border-gray-700">
//                       <td className="px-4 py-2">{firefighter.id}</td>
//                       <td className="px-4 py-2">{firefighter.zone}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Drones Table */}
//             <div>
//               <h2 className="text-xl font-semibold mb-2">Drones</h2>
//               <table className="min-w-full bg-gray-800 text-left border border-gray-700">
//                 <thead className="bg-gray-700">
//                   <tr>
//                     <th className="px-4 py-2 border-b border-gray-600">ID</th>
//                     <th className="px-4 py-2 border-b border-gray-600">Zone</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {reportData.drones.map((drone) => (
//                     <tr key={drone.id} className="border-b border-gray-700">
//                       <td className="px-4 py-2">{drone.id}</td>
//                       <td className="px-4 py-2">{drone.zone}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Dispatches Table */}
//             <div>
//               <h2 className="text-xl font-semibold mb-2">Dispatches</h2>
//               <table className="min-w-full bg-gray-800 text-left border border-gray-700">
//                 <thead className="bg-gray-700">
//                   <tr>
//                     <th className="px-4 py-2 border-b border-gray-600">ID</th>
//                     <th className="px-4 py-2 border-b border-gray-600">Alert ID</th>
//                     <th className="px-4 py-2 border-b border-gray-600">Police ID</th>
//                     <th className="px-4 py-2 border-b border-gray-600">Drone ID</th>
//                     <th className="px-4 py-2 border-b border-gray-600">Ambulance ID</th>
//                     <th className="px-4 py-2 border-b border-gray-600">Firefighter ID</th>
//                     <th className="px-4 py-2 border-b border-gray-600">Dispatch Time</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {reportData.dispatches.map((dispatch) => (
//                     <tr key={dispatch.id} className="border-b border-gray-700">
//                       <td className="px-4 py-2">{dispatch.id}</td>
//                       <td className="px-4 py-2">{dispatch.alert_id}</td>
//                       <td className="px-4 py-2">{dispatch.police_id}</td>
//                       <td className="px-4 py-2">{dispatch.drone_id}</td>
//                       <td className="px-4 py-2">{dispatch.ambulance_id}</td>
//                       <td className="px-4 py-2">{dispatch.firefighter_id}</td>
//                       <td className="px-4 py-2">{dispatch.dispatch_time}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// };

// export default ReportPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ReportData {
  alerts: any[];
  ambulances: any[];
  police: any[];
  firefighters: any[];
  drones: any[];
  dispatches: any[];
}

type SheetName = 'Alerts' | 'Ambulances' | 'Police' | 'Firefighters' | 'Drones' | 'Dispatches';

const ReportPage = () => {
  const navigate = useNavigate();

  // "Back" button logic
  const onBack = () => {
    navigate('/');
  };

  // Dropdown states
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Custom days input state
  const [customDays, setCustomDays] = useState('');

  // Report data from the API
  const [reportData, setReportData] = useState<ReportData | null>(null);

  // Tabs: which "sheet" is currently active
  const [activeSheet, setActiveSheet] = useState<SheetName>('Alerts');

  // Toggles the main dropdown
  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  // Handles selecting an option from the dropdown
  const handleSelectOption = (option: string) => {
    setSelectedOption(option);
    setShowDropdown(false);
  };

  // Handles the value of the custom days input
  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDays(e.target.value);
  };

  /**
   * If the user has chosen a valid option ("Today", "Week", "Month", "Custom"),
   * figure out the number of days and call the API.
   */
  useEffect(() => {
    if (!selectedOption) return; // No option selected yet, do nothing

    let days = 0;
    if (selectedOption === 'Today') {
      days = 1;
    } else if (selectedOption === 'Week') {
      days = 7;
    } else if (selectedOption === 'Month') {
      days = 30;
    } else if (selectedOption === 'Custom') {
      // Parse the customDays; default to 0 if invalid
      const parsed = parseInt(customDays, 10);
      if (parsed > 0) {
        days = parsed;
      } else {
        // If custom is selected but user hasn't provided a valid number yet,
        // we won't call the API
        return;
      }
    }

    // Now we can call the API with the `days` value
    fetch(`http://localhost:8000/api/reports/json/${days}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error fetching report data');
        }
        return res.json();
      })
      .then((data) => {
        // data should contain:
        // { alerts, ambulances, police, firefighters, drones, dispatches }
        setReportData(data);
      })
      .catch((err) => {
        console.error('Failed to fetch report data:', err);
        setReportData(null);
      });
  }, [selectedOption, customDays]);

  // Helper to produce an "Excel-like" table
  const renderExcelTable = (headers: string[], rows: any[], rowKeyFn: (row: any) => string | number) => {
    return (
      <div className="overflow-x-auto shadow-xl border-2 border-gray-600 rounded-lg bg-white excel-like-sheet">
        <table className="min-w-full text-sm text-left text-gray-800">
          <thead className="bg-gray-200 border-b-2 border-gray-400">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-2 font-semibold border-r border-gray-300 last:border-r-0">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any, idx: number) => (
              <tr key={rowKeyFn(row) ?? idx} className="border-b last:border-b-0 border-gray-300">
                {headers.map((header, colIdx) => (
                  <td
                    key={colIdx}
                    className="px-4 py-2 border-r border-gray-300 last:border-r-0 whitespace-nowrap"
                  >
                    {row[header.toLowerCase().replace(/\s/g, '_')] || row[header.toLowerCase()] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // We define each sheet's table definition
  const renderSheet = () => {
    if (!reportData) return <p className="text-white">No data loaded yet.</p>;

    // For each "sheet," we show a separate table with relevant headers
    switch (activeSheet) {
      case 'Alerts': {
        const headers = [
          'ID',
          'Type',
          'Severity',
          'Location',
          'Timestamp',
          'Responder Type',
          'Response Time',
          'Resolution Time',
          'Status',
        ];
        return renderExcelTable(headers, reportData.alerts, (row) => row.id);
      }
      case 'Ambulances': {
        const headers = ['ID', 'Zone'];
        return renderExcelTable(headers, reportData.ambulances, (row) => row.id);
      }
      case 'Police': {
        const headers = ['ID', 'Zone'];
        return renderExcelTable(headers, reportData.police, (row) => row.id);
      }
      case 'Firefighters': {
        const headers = ['ID', 'Zone'];
        return renderExcelTable(headers, reportData.firefighters, (row) => row.id);
      }
      case 'Drones': {
        const headers = ['ID', 'Zone'];
        return renderExcelTable(headers, reportData.drones, (row) => row.id);
      }
      case 'Dispatches': {
        const headers = [
          'ID',
          'Alert ID',
          'Police ID',
          'Drone ID',
          'Ambulance ID',
          'Firefighter ID',
          'Dispatch Time',
        ];
        return renderExcelTable(headers, reportData.dispatches, (row) => row.id);
      }
      default:
        return <p className="text-white">Select a sheet.</p>;
    }
  };

  return (
    <div className="bg-background w-full mt-5 pl-2 relative min-h-screen">
      {/* A header bar with the back button, just like in AlertDetails */}
      <div className="flex items-center justify-between ml-4">
        <Button
          variant="ghost"
          className="flex items-center gap-2 hover:bg-transparent p-2"
          onClick={onBack}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="50"
            height="50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transform scale-150"
          >
            <path d="M18 15h-6v4l-7-7 7-7v4h6v6z" />
          </svg>
        </Button>
      </div>

      {/* Main Content */}
      <div className="p-4 ml-5">
        <h1 className="text-2xl font-bold mb-4 text-white">Report</h1>

        {/* Dropdown Button */}
        <div className="relative mb-4">
          <Button
            onClick={toggleDropdown}
            className="bg-purple-400/80 text-white rounded px-4 py-2"
          >
            {selectedOption ? `Selected: ${selectedOption}` : 'Select Time Period'}
          </Button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute bg-white rounded mt-2 shadow-lg w-48 text-black z-50">
              <ul className="py-1">
                <li
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleSelectOption('Today')}
                >
                  Today
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleSelectOption('Week')}
                >
                  Week
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleSelectOption('Month')}
                >
                  Month
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleSelectOption('Custom')}
                >
                  Custom
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Show the "Custom" days input if user selected "Custom" */}
        {selectedOption === 'Custom' && (
          <div className="mb-6">
            <label className="block text-white mb-2" htmlFor="customDays">
              How many days?
            </label>
            <input
              id="customDays"
              type="number"
              value={customDays}
              onChange={handleDaysChange}
              className="p-2 border border-gray-300 rounded focus:outline-none"
              placeholder="e.g. 5"
              min={1}
            />
          </div>
        )}

        {/* Only show tab navigation if we have data */}
        {reportData && (
          <>
            {/* Tabs / "Worksheets" */}
            <div className="mb-4 flex flex-wrap gap-2">
              {([
                'Alerts',
                'Ambulances',
                'Police',
                'Firefighters',
                'Drones',
                'Dispatches',
              ] as SheetName[]).map((sheet) => (
                <button
                  key={sheet}
                  onClick={() => setActiveSheet(sheet)}
                  className={`rounded px-3 py-2 text-sm font-semibold 
                    ${
                      activeSheet === sheet
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                >
                  {sheet}
                </button>
              ))}
            </div>
            {/* Render the active sheet */}
            <div>{renderSheet()}</div>
          </>
        )}

        {/* If no data is loaded yet */}
        {!reportData && selectedOption && (
          <p className="text-white">Loading data or no data found for the selected period...</p>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
