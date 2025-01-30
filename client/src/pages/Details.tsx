import AlertDetails from '@/components/AlertDetails'
import { AlertType } from '@/types/alerts';

const testAlert: AlertType[] = [
    {
      id: '1',
      type: 'fire',
      severity: 'critical',
      location: '123 Main St, New York, NY',
      latitude: 40.7128,
      longitude: -74.0060,
      timestamp: new Date().toISOString(),
      description: 'Large fire detected in residential building. Multiple heat signatures detected.',
      image: './images/fire.png',
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
      image: './images/fire.png',
    },
  ];
  

const Details = () => {
  return (
    <AlertDetails 
      alert={testAlert} 
    />
  );
};

export default Details;