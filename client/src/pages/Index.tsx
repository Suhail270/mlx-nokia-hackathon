import React, { useState } from 'react';
import Map from '@/components/Map';
import AlertPanel from '@/components/AlertPanel';
import AlertList from '@/components/AlertList';
import AlertDetails from '@/components/AlertDetails'
import { AlertType } from '@/types/alerts';

// Mock data for demonstration
// const mockAlerts: AlertType[] = [
//   {
//     id: '1',
//     type: 'fire',
//     severity: 'critical',
//     location: '123 Main St, New York, NY',
//     latitude: 40.7128,
//     longitude: -74.0060,
//     timestamp: new Date().toISOString(),
//     description: 'Large fire detected in residential building. Multiple heat signatures detected.',
//     image: 'https://images.unsplash.com/photo-1599171571332-6d1c69c9f708?q=80&w=500&auto=format&fit=crop',
//   },
//   {
//     id: '2',
//     type: 'assault',
//     severity: 'warning',
//     location: '456 Park Ave, New York, NY',
//     latitude: 40.7528,
//     longitude: -73.9765,
//     timestamp: new Date().toISOString(),
//     description: 'Potential assault detected in parking garage. Two individuals involved.',
//     image: 'https://images.unsplash.com/photo-1617897711385-df9c86b7deb9?q=80&w=500&auto=format&fit=crop',
//   },
// ];

// const Index = () => {
//   const [selectedAlert, setSelectedAlert] = useState<AlertType | null>(null);

//   const handleAlertSelect = (alert: AlertType) => {
//     setSelectedAlert(alert);
//   };

//   const handleClosePanel = () => {
//     setSelectedAlert(null);
//   };

//   return (
//     <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
//       <div className="pl-80 pr-0">
//         <div className="p-6">
//           <Map alerts={mockAlerts} onAlertSelect={handleAlertSelect} />
//         </div>
//       </div>
//       <AlertList alerts={mockAlerts} onAlertSelect={handleAlertSelect} />
//       <AlertPanel alert={selectedAlert} onClose={handleClosePanel} />
//     </div>
//   );
// };

// export default Index;

// Test Details
const testAlert: AlertType = {
    type: 'fire',
    severity: 'critical',
    location: 'Jumeirah Village Circle, Dubai',
    timestamp: '2023-10-01T15:30:00Z',
    description: 'A fire broke out on the 12th floor of the Silver Heights Apartment complex...',
    image: '/images/fire-alert.png',
};

const Index = () => {
  return (
    <AlertDetails 
      alert={testAlert} 
      onBack={() => console.log('back clicked')} 
    />
  );
};

export default Index;