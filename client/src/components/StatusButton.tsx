import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const StatusButton = () => {
  // Initialize state from localStorage or default to 'unresolved'
  const [status, setStatus] = useState(() => {
    return localStorage.getItem('buttonStatus') || 'unresolved';
  });

  // Save status to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('buttonStatus', status);
  }, [status]);

  // Function to handle button click and cycle through statuses
  const handleClick = () => {
    switch (status) {
      case 'unresolved':
        setStatus('in progress');
        break;
      case 'in progress':
        setStatus('resolved');
        break;
      case 'resolved':
        setStatus('unresolved');
        break;
      default:
        setStatus('unresolved');
    }
  };

  // Determine button styling based on status
  const getButtonStyle = () => {
    switch (status) {
      case 'unresolved':
        return 'bg-red-600/20 hover:bg-red-600/20 text-red-500 hover:text-red-500';
      case 'in progress':
        return 'bg-yellow-600/20 hover:bg-yellow-600/20 text-yellow-500 hover:text-yellow-500';
      case 'resolved':
        return 'bg-green-600/20 hover:bg-green-600/20 text-green-500 hover:text-green-500';
      default:
        return 'bg-gray-600/20 hover:bg-gray-600/20 text-gray-500 hover:text-gray-500';
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className={`rounded-full mr-10 ${getButtonStyle()}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Button>
  );
};

export default StatusButton;