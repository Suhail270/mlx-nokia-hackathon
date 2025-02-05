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
   * Helper to compute the numeric "days" based on user selection.
   * Returns null if we don't have a valid selection yet.
   */
  const computeDays = (): number | null => {
    if (!selectedOption) return null;

    let days = 0;
    if (selectedOption === 'Today') {
      days = 1;
    } else if (selectedOption === 'Week') {
      days = 7;
    } else if (selectedOption === 'Month') {
      days = 30;
    } else if (selectedOption === 'Custom') {
      const parsed = parseInt(customDays, 10);
      if (parsed > 0) {
        days = parsed;
      } else {
        return null;
      }
    }
    return days;
  };

  /**
   * If the user has chosen a valid option ("Today", "Week", "Month", "Custom"),
   * figure out the number of days and call the API.
   */
  useEffect(() => {
    if (!selectedOption) return; // No option selected yet, do nothing

    const days = computeDays();
    if (days === null) return; // customDays invalid or no valid days

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

  // NEW: Handler to download the Excel file from /reports/excel/{days}.
  const handleDownloadExcel = () => {
    const days = computeDays();
    if (days === null) return; // No valid day range selected
    // Force download by navigating to the excel endpoint:
    const url = `http://localhost:8000/api/reports/excel/${days}`;
    window.open(url, '_blank');
  };

  // Helper to produce an "Excel-like" table
  const renderExcelTable = (headers: string[], rows: any[], rowKeyFn: (row: any) => string | number) => {
    return (
      <div className="overflow-x-auto shadow-2xl border border-gray-700 rounded-lg bg-gradient-to-b from-[#161616] to-[#1f1f1f]">
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="bg-gradient-to-r from-green-600 via-yellow-400 to-red-700 text-white border-b border-gray-600">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-semibold border-r border-gray-500 last:border-r-0 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any, idx: number) => (
              <tr key={rowKeyFn(row) ?? idx} className="border-b border-gray-600 last:border-b-0 hover:bg-gray-800 transition-colors duration-200">
                {headers.map((header, colIdx) => (
                  <td
                    key={colIdx}
                    className="px-4 py-3 border-r border-gray-600 last:border-r-0 whitespace-nowrap"
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
        <h1 className="text-3xl font-bold mb-6 text-gray-200 tracking-wide">Report</h1>
        <h3> Custom report generation based on specific time frame</h3>
        <br></br>

        {/* Dropdown Button */}
        <div className="relative mb-4">
          <Button
            onClick={toggleDropdown}
            className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded px-4 py-2 hover:scale-105 transition-transform"
          >
            {selectedOption ? `Selected: ${selectedOption}` : 'Select Time Period'}
          </Button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute bg-gray-800 rounded mt-2 shadow-lg w-48 text-gray-200 z-50 border border-gray-700">
              <ul className="py-1">
                <li
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleSelectOption('Today')}
                >
                  Today
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleSelectOption('Week')}
                >
                  Week
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleSelectOption('Month')}
                >
                  Month
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
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
            <label className="block text-gray-300 mb-2" htmlFor="customDays">
              How many days?
            </label>
            <input
              id="customDays"
              type="number"
              value={customDays}
              onChange={handleDaysChange}
              className="p-2 border border-gray-600 rounded focus:outline-none focus:border-purple-500 bg-[#1b1b1b] text-gray-100"
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
                  className={`rounded px-3 py-2 text-sm font-semibold border border-transparent transition-colors 
                    ${
                      activeSheet === sheet
                      ? 'bg-gradient-to-r from-green-600 to-green-800 text-white shadow-md'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                >
                  {sheet}
                </button>
              ))}
            </div>

            {/* Render the active sheet */}
            <div>{renderSheet()}</div>

            {/* NEW BUTTON: Download Excel */}
            <div className="mt-6">
              <Button
                onClick={handleDownloadExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Download Excel
              </Button>
            </div>
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
