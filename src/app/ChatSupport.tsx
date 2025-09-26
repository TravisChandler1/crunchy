"use client";
import { useState, useEffect, useRef } from "react";
import { FaComments, FaTimes, FaPaperPlane, FaUser, FaRobot } from "react-icons/fa";

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'support' | 'bot';
  timestamp: Date;
  senderName?: string;
};

const FAQ_RESPONSES = {
  'delivery time': 'Our delivery usually takes 3-6 hours within Ibadan. For other locations, it may take 1-3 days depending on distance.',
  'payment': 'We accept payments via Paystack (card, bank transfer, USSD). Payment is required before delivery.',
  'ingredients': 'Our chips are made from fresh plantains, palm oil, and natural seasonings. No artificial preservatives!',
  'order status': 'You can track your order using the order reference we sent to your phone. Visit our tracking page.',
  'cancel order': 'Orders can be cancelled within 10 minutes of placement. After that, please contact us directly.',
  'bulk order': 'For bulk orders (50+ packs), please contact us directly for special pricing and arrangements.',
  'locations': 'We currently deliver within Ibadan and surrounding areas. Delivery charges vary by distance.',
  'shelf life': 'Our chips stay fresh for 2-3 weeks when stored in a cool, dry place in the original packaging.'
};

export default function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: "Hi! I'm here to help you with any questions about Crunchy Cruise Snacks. What can I assist you with today?",
        sender: 'bot',
        timestamp: new Date(),
        senderName: 'CrunchBot'
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const findBestResponse = (userMessage: string): string | null => {
    const message = userMessage.toLowerCase();
    
    for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
      if (message.includes(key)) {
        return response;
      }
    }
    
    // Check for greetings
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! How can I help you today? You can ask me about delivery times, ingredients, order tracking, or anything else about our delicious plantain chips!";
    }
    
    // Check for thanks
    if (message.includes('thank') || message.includes('thanks')) {
      return "You're welcome! Is there anything else I can help you with? 😊";
    }
    
    return null;
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      senderName: customerName || 'You'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = findBestResponse(inputText);
      
      const responseText = botResponse || 
        "I understand you need help with that. Let me connect you with our support team for personalized assistance. In the meantime, you can also reach us on WhatsApp at +2348101718187.";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
        senderName: 'CrunchBot'
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      // If no FAQ match, escalate to human support after a delay
      if (!botResponse) {
        setTimeout(() => {
          const escalationMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: "A member of our support team will be with you shortly. Please hold on! 👨‍💼",
            sender: 'bot',
            timestamp: new Date(),
            senderName: 'CrunchBot'
          };
          setMessages(prev => [...prev, escalationMessage]);
        }, 2000);
      }
    }, 1000 + Math.random() * 1000);
  };

  const handleNameSubmit = () => {
    if (customerName.trim()) {
      setShowNameInput(false);
      const greetingMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Nice to meet you, ${customerName}! How can I help you today?`,
        sender: 'bot',
        timestamp: new Date(),
        senderName: 'CrunchBot'
      };
      setMessages(prev => [...prev, greetingMessage]);
    }
  };

  const quickQuestions = [
    "What are your delivery times?",
    "How can I track my order?",
    "What ingredients do you use?",
    "Can I cancel my order?",
    "Do you offer bulk discounts?"
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 bg-[#7ed957] text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center hover:bg-[#45523e] transition"
        aria-label="Open chat support"
      >
        {isOpen ? <FaTimes className="text-2xl" /> : <FaComments className="text-2xl" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 z-50 w-80 h-96 bg-white rounded-lg shadow-xl border border-[#7ed957] flex flex-col">
          {/* Header */}
          <div className="bg-[#7ed957] text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaComments />
              <span className="font-semibold">Crunchy Support</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs">Online</span>
            </div>
          </div>

          {/* Name Input */}
          {showNameInput && (
            <div className="p-4 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-2">What&apos;s your name?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#7ed957]"
                  onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                />
                <button
                  onClick={handleNameSubmit}
                  className="px-3 py-2 bg-[#7ed957] text-white rounded-lg text-sm hover:bg-[#45523e] transition"
                >
                  OK
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-[#7ed957] text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.sender === 'user' ? (
                      <FaUser className="text-xs" />
                    ) : (
                      <FaRobot className="text-xs" />
                    )}
                    <span className="text-xs font-medium">{message.senderName}</span>
                  </div>
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaRobot className="text-xs" />
                    <span className="text-xs font-medium">CrunchBot</span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {!showNameInput && messages.length <= 2 && (
            <div className="p-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
              <div className="space-y-1">
                {quickQuestions.slice(0, 3).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputText(question)}
                    className="w-full text-left text-xs p-2 bg-gray-50 hover:bg-gray-100 rounded border text-gray-700"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          {!showNameInput && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#7ed957]"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim()}
                  className="px-3 py-2 bg-[#7ed957] text-white rounded-lg hover:bg-[#45523e] transition disabled:opacity-50"
                >
                  <FaPaperPlane className="text-sm" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}