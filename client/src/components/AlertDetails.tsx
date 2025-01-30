import React from 'react';
import { AlertType } from '@/types/alerts';
import { ChevronLeft, Bell, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image'

const AlertDetails = () => {
  return (
    <div className="bg-background w-full">
    
    <Button 
        variant="ghost" 
        className="flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Alerts
    </Button>

    {/* To divide left and right */}
    <div className='flex gap-6 mt-0 pb-10 h-screen'>
        {/* Info */}
        <div className='text-white text-sm w-1/2'>
            {/* First line */}
            <div className='flex gap-6 p-5'> 
                <div className='text-white text-sm w-1/3 bg-secondary p-5'> 
                    Alert
                </div>
                <div className='text-white text-sm w-2/3 bg-secondary p-5'> 
                    Location
                </div>
            </div>
            {/* Second line */}
            <div className='text-white text-sm bg-secondary mt-2 m-5 p-20'> 
                Detail
            </div>
            {/* Third line */}
            <div className='text-white text-sm bg-secondary m-5 p-20'> 
                Map
            </div>
        </div>

         {/* Image */}
         <div className='text-white w-1/2 bg-secondary mb-12 mt-5 mr-10 p-5'>
            Image
        </div>

    </div>
    </div>      
  );
};

export default AlertDetails;