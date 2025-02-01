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
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    { text: 'Hi, how can I help you?', sender: 'chatbot' }, 
  ]);


  const toggleChatbot = () => {
    setChatbotVisible(!chatbotVisible);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return; // Don't send empty messages
  
    // Add the user's message to the messages array
    const userMessage = { sender: 'user', text: inputValue };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
  
    // Prepare the conversation history (excluding the default message)
    const conversationHistory = messages
      .filter((msg) => msg.text !== "hi what can I help you with") // Exclude the default message
      .map((msg) => ({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text }));
  
    // Add the user's current message to the conversation history
    conversationHistory.push({ role: 'user', content: inputValue });
  
    try {
      // Send the user's message and conversation history to the API
      const response = await fetch(`http://localhost:8000/api/chat_with_alert/${alert.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: inputValue,
          conversation_history: conversationHistory,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
  
      const data = await response.json();
  
      // Add the chatbot's response to the messages array
      const botMessage = { sender: 'chatbot', text: data.answer };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { sender: 'chatbot', text: "Sorry, something went wrong. Please try again." };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  
    // Clear the input field
    setInputValue('');
  
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
        <script>console.log('Video Path:', alert.video_path);</script>
        {/* Right Section - Image */}
        <div className="text-white w-1/2 bg-secondary rounded-lg mb-14 mt-5 mr-10 p-7 h-[88%]">
          <video controls className='h-full w-full'>
            <source src={`/${alert.video_path.split('/').pop()}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        {/* Right Section - Video
        <div className="text-white w-1/2 bg-secondary rounded-lg mb-14 mt-5 mr-10 p-7 h-[88%]">
          <video
            src={alert.video_path}
            controls
            className="w-full h-full object-cover rounded-lg"
          >
            Your browser does not support the video tag.
          </video>
        </div> */}

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
        <div className="fixed bottom-12 right-16 w-80 h-96 bg-white shadow-lg rounded-t-lg p-5 rounded-lg flex flex-col">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Chatbot</h3>
            <Button variant="ghost" onClick={toggleChatbot} className='text-white bg-black'>X</Button>
          </div>
          <div className="mt-4 flex-1 overflow-y-auto space-y-2">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex relative">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="flex-1 p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Type a message..."
            />
            <Button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertDetails;