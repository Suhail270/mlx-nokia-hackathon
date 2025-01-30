import React, { useState } from 'react';
import { AlertType } from '@/types/alerts';
import { ChevronLeft, Bell, MapPin, Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Map from '@/components/Map';
import Image from 'next/image';

const AlertDetails = ({ alert, onBack }: { alert: AlertType; onBack: () => void }) => {
  const [chatbotVisible, setChatbotVisible] = useState(false);
  const [isResolved, setIsResolved] = useState(false);

  const toggleChatbot = () => {
    setChatbotVisible(!chatbotVisible);
  };

  const toggleResolved = () => {
    setIsResolved(!isResolved); 
  };


  return (
    <div className="bg-background w-full mt-5 pl-2 relative">

        <div className='flex'>
            {/* Back button */}
            <div>
                <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 hover:bg-transparent" 
                    onClick={onBack} // Calls the function to go back
                    >
                    <ChevronLeft className="w-10 h-10" />
                </Button>
            </div>

            {/* Status Button */}
            <div className="absolute left-3/4 transform -translate-x-1/2">
                <Button
                    className={`px-4 py-2 text-white font-semibold rounded-full ${
                        isResolved ? 'bg-green-500/20' : 'bg-red-500/20'
                    } hover:bg-opacity-80`} // Added hover opacity change
                    onClick={toggleResolved}
                    >
                    {isResolved ? 'Resolved' : 'Unresolved'}
                </Button>
            </div>
        </div>

      

      {/* Layout structure */}
      <div className="flex gap-6 mt-0 pb-10 h-screen">
        {/* Left Section - Alert Information */}
        <div className="text-white text-sm w-1/2">
          {/* Alert Type and Severity */}
          <div className="flex gap-6 p-5"> 
            <div className="text-white text-sm w-1/3 bg-secondary rounded-lg p-5"> 
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full
                  ${alert.severity === 'critical' ? 'bg-red-500/20 text-red-500' :
                    alert.severity === 'warning' ? 'bg-orange-500/20 text-orange-500' :
                    'bg-blue-500/20 text-blue-500'}`} >
                  <Bell className="w-4 h-4" />
                </div>
                
                <div>
                  <h2 className="text-md font-semibold capitalize">{alert.type} Alert</h2>  
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="text-white text-sm w-2/3 bg-secondary rounded-lg p-5"> 
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <p className="text-muted-foreground">{alert.location}</p>
              </div>
            </div>
          </div>

          {/* Alert Details */}
          <div className="text-white text-sm bg-secondary rounded-lg mt-2 mx-5 p-5"> 
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Details</h3>
            </div>
            <p className="text-muted-foreground">{alert.description}</p>
          </div>

          {/* Placeholder for Map */}
          <div className="text-white text-sm bg-secondary rounded-lg m-5 p-20"> 
            Map
          </div>
        </div>

        {/* Right Section - Image */}
        <div className="text-white w-1/2 bg-secondary rounded-lg mb-14 mt-5 mr-10 p-7">
          Image
        </div>
      </div>

      {/* Chatbot Popup Button */}
      <div
        onClick={toggleChatbot}
        className="fixed bottom-5 right-5 bg-purple-400 p-3 rounded-full shadow-lg cursor-pointer mb-2"
      >
        <span className="text-black"><MessageSquare className='w-6 h-6 scale-x-[-1]'/> </span> {/* Chat icon */}
      </div>

      {/* Chatbot Popup */}
      {chatbotVisible && (
        <div className="fixed bottom-14 right-14 w-80 h-96 bg-white shadow-lg rounded-t-lg p-5 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Chatbot</h3>
            <Button variant="ghost" onClick={toggleChatbot} className='text-white bg-black'>X</Button>
          </div>
          <div className="mt-4">
            {/* You can add actual chatbot content here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertDetails;
