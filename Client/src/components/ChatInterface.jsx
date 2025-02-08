import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaPaperPlane, FaUser, FaRobot, FaSpinner, FaChevronDown } from "react-icons/fa";
import { ChatProvider, useChat } from '../contexts/ChatContext';

const ChatInterface = ({ onClose }) => {
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const { messages, sendMessage, loading } = useChat();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      await sendMessage(message);
      setMessage("");
    }
  };

  const MessageBubble = ({ msg, index }) => (
    <div 
      key={index}
      className={`flex ${msg.type === 'bot' ? "justify-start" : "justify-end"} gap-2 mb-2`}
    >
      <div 
        className={`p-3 rounded-lg max-w-[80%] ${
          msg.type === 'bot' 
            ? "bg-gray-100 text-gray-800 shadow-sm"
            : "bg-[#8DD3BB] text-white"
        }`}
        aria-label={`Message from ${msg.type === 'bot' ? 'Travel Bot' : 'You'}`}
      >
        <div className="flex items-center gap-2 mb-1">
          {msg.type === 'bot' ? (
            <FaRobot className="text-gray-600" aria-hidden="true" />
          ) : (
            <FaUser className="text-white" aria-hidden="true" />
          )}
          <span className="text-xs font-medium">
            {msg.type === 'bot' ? "Travel Bot" : "You"}
          </span>
        </div>
        <p className="text-sm break-words">{msg.content}</p>
      </div>
    </div>
  );

  return (
    <div className={`
      fixed right-4 bottom-4 w-full max-w-md bg-white rounded-lg shadow-xl z-50 
      transition-all duration-300 ease-in-out
      ${isExpanded ? 'h-[600px] md:h-[500px]' : 'h-16'}
      overflow-hidden
    `}>
      {/* Header */}
      <div 
        className="bg-gray-800 text-white p-4 rounded-t-lg flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-semibold flex items-center">
          Travel Assistant
          <FaChevronDown 
            className={`ml-2 transition-transform duration-300 
              ${isExpanded ? 'rotate-180' : 'rotate-0'}`} 
          />
        </h3>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="hover:text-[#8DD3BB] transition-colors"
          aria-label="Close chat"
        >
          <FaTimes />
        </button>
      </div>

      {/* Messages Container */}
      {isExpanded && (
        <div className="h-[calc(100%-130px)] p-4 overflow-y-auto space-y-2 custom-scrollbar">
          {messages.map((msg, index) => (
            <MessageBubble key={msg.id || index} msg={msg} index={index} />
          ))}
          
          {loading && (
            <div className="flex justify-start items-center gap-2 p-3 bg-gray-100 rounded-lg">
              <FaSpinner className="animate-spin text-gray-600" />
              <span className="text-sm text-gray-600">Travel Bot is typing...</span>
            </div>
          )}

          
          
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Message Input */}
      {isExpanded && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message..."
              disabled={loading}
              className="w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#2ba67b] 
                disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Type your message"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !message.trim()}
              className="bg-[#8DD3BB] text-white p-2 rounded-lg hover:bg-[#2ba67b] 
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center
                min-w-[40px]"
              aria-label="Send message"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ChatInterfaceWithProvider = ({ onClose }) => {
  return (
    <ChatProvider>
      <ChatInterface onClose={onClose} />
    </ChatProvider>
  );
};

export default ChatInterfaceWithProvider;