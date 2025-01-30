import React from 'react';
import { AlertType } from '@/types/alerts';
import { ChevronLeft, Bell, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image'

const AlertDetails = ({alert}) => {
  return (
    <div className="bg-background w-full">
    
    <Button variant="ghost" className="flex items-center gap-2">
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
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full
                            ${alert.severity === 'critical' ? 'bg-red-500/20 text-red-500' :
                            alert.severity === 'warning' ? 'bg-orange-500/20 text-orange-500' :
                                'bg-blue-500/20 text-blue-500'
                            }`}>
                            <Bell className="w-4 h-4" />
                        </div>
                        
                        <div>
                            <h2 className="text-md font-semibold capitalize">{alert.type} Alert</h2>  
                        </div>
                    </div>
                    
                </div>
                <div className='text-white text-sm w-2/3 bg-secondary p-5'> 
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <p className="text-muted-foreground">{alert.location}</p>
                    </div>

                </div>
            </div>

            {/* Second line */}
            <div className='text-white text-sm bg-secondary mt-2 mx-5 p-5'> 
                <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Details</h3>
                </div>
                <p className="text-muted-foreground">{alert.description}</p>
            </div>

            {/* Third line */}
            <div className='text-white text-sm bg-secondary m-5 p-20'> 
                Map
            </div>
        </div>

         {/* Image */}
         <div className='text-white w-1/2 bg-secondary mb-14 mt-5 mr-10 p-7'>
            Image
        </div>

    </div>
    </div>      
  );
};

export default AlertDetails;