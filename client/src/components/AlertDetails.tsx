import React, { useState, useEffect, useContext } from 'react';
import { AlertType } from '@/types/alerts';
import { ChevronLeft, Bell, MapPin, Clock, MessageSquare, ArrowBigLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LanguageContext } from '../pages/LanguageContext';
import Map from '@/components/Map';
import Image from 'next/image';
import { MdClose } from 'react-icons/md';
import { IoIosCloseCircle,IoMdCloseCircle } from "react-icons/io";
import  StatusButton from "./StatusButton";

const AlertDetails = ({ alert, onBack }: { alert: AlertType; onBack: () => void }) => {
  const [chatbotVisible, setChatbotVisible] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  // const [isArabic, setIsArabic] = useState(false);
  const languageContext = useContext(LanguageContext);
  const [inputValue, setInputValue] = useState('');
  const [summary, setSummary] = useState('');
  const [messages, setMessages] = useState([
    { text: 'Hi, how can I help you?', sender: 'chatbot' }, 
  ]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/summary/${alert.id}?lang=${languageContext.isArabic ? 'ar' : 'en'}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setSummary(data.summary); // Assuming the API returns an object with a 'summary' field
      } catch (error) {
        console.error('Error fetching summary:', error);
        setSummary('Failed to load summary.');
      }
    };

    fetchSummary();
  });


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
      const response = await fetch(`http://localhost:8000/api/chat_with_alert/${alert.id}?lang=${languageContext.isArabic ? 'ar' : 'en'}`, {
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
        {/* <Button
          onClick={() => setIsResolved(!isResolved)}
          variant="outline"
          className={`rounded-full mr-10 ${
            isResolved 
              ? 'bg-green-600/20 hover:bg-green-600/20 text-green-500 hover:text-green-500' 
              : 'bg-red-600/20 hover:bg-red-600/20 text-red-500 hover:text-red-500'
          }`}
        >
          {isResolved ? 'Resolved' : 'Unresolved'}
        </Button> */}

        <StatusButton/>
      </div>

      

      {/* Layout structure */}
      <div className="flex flex-col gap-6 mt-0 pb-10 h-screen md:flex-row overflow-hidden">
        {/* Left Section - Alert Information */}
        <div className="text-white text-sm w-full md:w-1/2">
          {/* Alert Type and Severity */}
          <div className="flex flex-col gap-6 p-5 md:flex-row"> 
            <div className="text-white text-sm w-full md:w-1/3 bg-secondary rounded-lg p-5"> 
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full          
                  ${alert.type === 'fire' || alert.type === 'نار' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500' }`} >
                  <Bell className="w-4 h-4" />
                </div>
                
                <div>
                  <h2 className="text-lg text-muted-foreground capitalize">{alert.type} Alert</h2>  
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="text-white text-sm w-full md:w-2/3 bg-secondary rounded-lg"> 
              <div className="flex justify-center gap-2 pt-5 overflow-x-auto">
                <MapPin className="w-5 h-5" />
                <p className="text-muted-foreground text-lg">{alert.location}</p>
              </div>
            </div>
          </div>

          {/* Alert Details */}
          <div className="text-white text-sm bg-secondary rounded-lg mt-2 mx-5 p-5 pt-3 h-[10%] md:h-[30%]"> 
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Details</h3>
            </div>
            <div className='overflow-y-auto h-[77%]'>
              <p className="text-muted-foreground">{summary}</p>
            </div>
            
          </div>

          {/* Video (Mobile View) */}
          <div className="text-white w-[90%] bg-secondary rounded-lg mt-5 mx-5 p-0 h-[13%] md:hidden">
            <video controls autoPlay loop className='h-full w-full'>
              <source src={`/${alert.video_path.split('/').pop()}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Map */}
          <div className="text-white text-sm bg-secondary rounded-lg m-5 h-[12%] md:h-[33.5%] w-[93%] overflow-hidden">
            <Map 
              alerts={[alert]} 
              onAlertSelect={() => {}} 
              midpoint={[alert.latitude, alert.longitude]} 
              centerOffset={100}
            />
          </div>
        </div>

        {/* Right Section - Video (Desktop View) */}
        <div className="text-white w-full md:w-1/2 bg-secondary rounded-lg mb-14 mt-5 mr-10 p-7 h-[88%] hidden md:block">
          <video controls autoPlay loop className='h-full w-full'>
            <source src={`/${alert.video_path.split('/').pop()}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* Chatbot Popup Button */}
      <div
        onClick={toggleChatbot}
        className="fixed bottom-5 right-5 bg-purple-400/80 p-3 rounded-full shadow-lg cursor-pointer mb-2 z-50"
      >
        <span className="text-black"><MessageSquare className='w-6 h-6 scale-x-[-1]'/> </span> {/* Chat icon */}
      </div>

      {/* Chatbot Popup */}
      {chatbotVisible && (
        <div className="fixed bottom-16 right-16 w-[75%] md:w-[38rem] h-[50%] md:h-[30rem] bg-background shadow-lg rounded-t-lg p-5 rounded-lg flex flex-col border border-gray-500 z-[100]">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">      </h3>
            {/* <button className="bg-purple-400/80 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2"> ENGLISH </button> */}
            {/* <Button
              onClick={() => setIsArabic(!isArabic)}
              variant="outline"
              className={`rounded-full mr-10 ${
                isArabic 
                  ? 'bg-green-600/20 hover:bg-green-600/20 text-green-500 hover:text-green-500' 
                  : 'bg-red-600/20 hover:bg-red-600/20 text-red-500 hover:text-red-500'
              }`}
            >
              {isArabic ? 'English' : 'Arabic'}
            </Button> */}
            {/* <IoIosCloseCircle size={30} variant="ghost" onClick={toggleChatbot} /> */}
            {/* <Button variant="ghost" onClick={toggleChatbot} className='text-white bg-black px-3 py-2 text-sm'></Button> */}
            <div
              className="bg-red-500/20 text-red-500 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer  text-lg"
              onClick={toggleChatbot}
            >
              x
            </div>
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
                      ? 'bg-purple-400/80 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex space-x-2 relative">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black w-[60%]"
              placeholder="Type a message..."
            />
            <Button
              onClick={handleSendMessage}
              className="bg-purple-400/80 text-white rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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