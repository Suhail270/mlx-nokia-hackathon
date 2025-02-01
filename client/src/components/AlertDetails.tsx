import React, { useState } from 'react';
import { AlertType } from '@/types/alerts';
import { ChevronLeft, Bell, MapPin, Clock, MessageSquare, ArrowBigLeft } from 'lucide-react';
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


  return (
    <div className="bg-background w-full mt-5 pl-2 relative">

<div className="flex items-center justify-between ml-4">
        {/* Back button */}
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
            <path d="M18 15h-6v4l-7-7 7-7v4h6v6z"/>
          </svg>
        </Button>

        {/* Status Button */}
        <Button
          onClick={() => setIsResolved(!isResolved)}
          variant="outline"
          className={`rounded-full mr-10 ${
            isResolved 
              ? 'bg-green-600/20 hover:bg-green-600/20 text-green-500 hover:text-green-500' 
              : 'bg-red-600/20 hover:bg-red-600/20 text-red-500 hover:text-red-500'
          }`}
        >
          {isResolved ? 'Resolved' : 'Unresolved'}
        </Button>
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
                  ${alert.type === 'fire' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500' }`} >
                  <Bell className="w-4 h-4" />
                </div>
                
                <div>
                  <h2 className="text-md font-semibold capitalize">{alert.type} Alert</h2>  
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="text-white text-sm w-2/3 bg-secondary rounded-lg p-5"> 
              <div className="flex items-center gap-2 pt-2 justify-center">
                <MapPin className="w-4 h-4" />
                <p className="text-muted-foreground">{alert.location}</p>
              </div>
            </div>
          </div>

          {/* Alert Details */}
          <div className="text-white text-sm bg-secondary rounded-lg mt-2 mx-5 p-5 pt-3 h-[30%]"> 
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Details</h3>
            </div>
            <p className="text-muted-foreground">{alert.description}</p>
          </div>

          {/* Placeholder for Map */}
          {/* <div className="text-white text-sm bg-secondary rounded-lg m-5 h-[33.5%] w-[93%] overflow-hidden">
            <Map 
              alerts={[alert]} 
              onAlertSelect={() => {}} 
              midpoint={[alert.latitude, alert.longitude]} 
            />
          </div> */}

          <div className="text-white text-sm bg-secondary rounded-lg m-5 h-[33.5%] w-[93%] overflow-hidden">
            <Map 
              alerts={[alert]} 
              onAlertSelect={() => {}} 
              midpoint={[alert.latitude, alert.longitude]} 
              centerOffset={100}
            />
          </div>


        </div>

        {/* Right Section - Image */}
        <div className="text-white w-1/2 bg-secondary rounded-lg mb-14 mt-5 mr-10 p-7 h-[88%]">
          <img src={alert.image}></img>
        </div>
      </div>

      {/* Chatbot Popup Button */}
      <div
        onClick={toggleChatbot}
        className="fixed bottom-5 right-5 bg-purple-400/80 p-3 rounded-full shadow-lg cursor-pointer mb-2"
      >
        <span className="text-black"><MessageSquare className='w-6 h-6 scale-x-[-1]'/> </span> {/* Chat icon */}
      </div>

      {/* Chatbot Popup */}
      {chatbotVisible && (
        <div className="fixed bottom-6 right-14 w-80 h-96 bg-white shadow-lg rounded-t-lg p-5 rounded-lg">
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