import React from 'react';
import { AlertType } from '@/types/alerts';
import { ChevronLeft, Bell, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image'

interface AlertDetailsProps {
  alert: AlertType;
  onBack: () => void;
}

const AlertDetails = ({ alert, onBack }: AlertDetailsProps) => {
  return (
    <div className="w-full h-full bg-background p-6">
      {/* Back button */}
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mb-6 flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Alerts
      </Button>

      <div className="flex gap-6">
        {/* Left column with 3 vertical cards */}
        <div className="w-2/5 space-y-6">

            <div className = "flex gap-4">

                {/* Alert  */}
                <Card className="p-6 w-1/3 bg-secondary">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-full
                            ${alert.severity === 'critical' ? 'bg-red-500/20 text-red-500' :
                            alert.severity === 'warning' ? 'bg-orange-500/20 text-orange-500' :
                                'bg-blue-500/20 text-blue-500'
                            }`}>
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold capitalize mt-1">{alert.type} Alert</h2>  
                        </div>
                    </div>
                    <div className={`text-md pl-5 ${
                        alert.severity === 'critical' ? 'text-red-500' :
                        alert.severity === 'warning' ? 'text-orange-500' :
                        'text-blue-500'
                        }`}>
                        {alert.severity.toUpperCase()}
                    </div>
                    
                    
                </Card>

                {/* Location */}
                <Card className="p-6 w-2/3 bg-secondary">
                    <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Location</h3>
                    </div>
                    <p className="text-muted-foreground">{alert.location}</p>

                    <p className="mt-4 text-sm text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleString()}
                    </p>

                </Card>
            </div>
          

          {/* Details */}
          <Card className="p-6 bg-secondary">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Details</h3>
            </div>
            <p className="text-muted-foreground">{alert.description}</p>
          </Card>

        </div>

        {/* Right column with large image */}
        <div className="w-2/3">
          <Card className="h-full overflow-hidden">
            {/* <Image src={alert.image} alt={`${alert.type} incident`} className="w-full h-full"></Image> */}
            <img src={alert.image}></img>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default AlertDetails;