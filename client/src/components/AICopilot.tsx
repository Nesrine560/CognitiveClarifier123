import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/types";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface AICopilotProps {
  user: User;
}

export default function AICopilot({ user }: AICopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Initial greeting message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          sender: "ai",
          text: `Hi ${user.name || "there"}! I'm your mental wellness assistant. How can I help you today?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [user.name, messages.length]);
  
  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    // Simulate AI thinking
    setIsTyping(true);
    
    // This would be replaced with an actual AI response API call
    setTimeout(() => {
      respondToMessage(input);
      setIsTyping(false);
    }, 1500);
  };
  
  const respondToMessage = (userInput: string) => {
    // Very simple pattern matching for demo purposes
    // In a real app, this would call an API endpoint to process the message
    let response = "";
    
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes("anxious") || lowerInput.includes("anxiety")) {
      response = "I understand how anxiety can feel overwhelming. Would you like to try a quick breathing exercise to help calm your nerves, or would you prefer to talk more about what's causing your anxiety?";
    } else if (lowerInput.includes("sad") || lowerInput.includes("depressed")) {
      response = "I'm sorry to hear you're feeling down. Remember that emotions are temporary and it's okay to feel sad sometimes. Would it help to talk about what's contributing to these feelings?";
    } else if (lowerInput.includes("stressed") || lowerInput.includes("overwhelmed")) {
      response = "When you're feeling stressed, it can help to break things down into smaller, manageable tasks. Would you like some techniques for managing stress, or would you like to explore what's causing this feeling?";
    } else if (lowerInput.includes("breathing") || lowerInput.includes("breathe")) {
      response = "Breathing exercises can be really helpful! Try the 4-7-8 technique: Inhale for 4 seconds, hold for 7 seconds, then exhale for 8 seconds. Repeat this 4 times and notice how your body feels.";
    } else if (lowerInput.includes("meditation") || lowerInput.includes("meditate")) {
      response = "Meditation is a great practice for mental wellness. The app has several guided meditations you can try. Would you like me to recommend one based on how you're feeling?";
    } else if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      response = `Hello ${user.name || "there"}! How are you feeling today? I'm here to support your mental wellness journey.`;
    } else {
      response = "Thank you for sharing. Would you like to explore this further, or perhaps try one of our exercises like breathing, meditation, or thought restructuring?";
    }
    
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: response,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
  };
  
  return (
    <>
      {/* Floating button to open chat */}
      <div className="fixed right-5 bottom-20 z-20">
        <Button 
          className="rounded-full w-14 h-14 bg-accent-500 hover:bg-accent-600 shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <i className="ri-robot-line text-2xl"></i>
        </Button>
      </div>
      
      {/* Chat modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-x-0 bottom-0 z-30"
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="bg-white rounded-t-xl max-w-md mx-auto w-full p-5 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <i className="ri-robot-line text-accent-500 mr-2"></i>
                  AI Mental Coach
                </h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  <i className="ri-close-line text-xl"></i>
                </Button>
              </div>
              
              <div className="h-64 overflow-y-auto bg-gray-50 rounded-lg p-3 mb-4">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.sender === "user" ? "justify-end mb-3" : "mb-3"}`}
                  >
                    {message.sender === "ai" && (
                      <div className="w-8 h-8 rounded-full bg-accent-100 flex-shrink-0 flex items-center justify-center mr-2">
                        <i className="ri-robot-line text-accent-500"></i>
                      </div>
                    )}
                    <div 
                      className={`rounded-lg p-3 max-w-[80%] ${
                        message.sender === "user" 
                          ? "bg-primary-100" 
                          : "bg-white shadow-soft"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex mb-3">
                    <div className="w-8 h-8 rounded-full bg-accent-100 flex-shrink-0 flex items-center justify-center mr-2">
                      <i className="ri-robot-line text-accent-500"></i>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-soft flex items-center">
                      <span className="flex space-x-1">
                        <span className="h-2 w-2 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                        <span className="h-2 w-2 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                        <span className="h-2 w-2 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                      </span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              <div className="flex">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  className="rounded-r-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button 
                  className="rounded-l-none bg-accent-500 hover:bg-accent-600"
                  onClick={handleSendMessage}
                >
                  <i className="ri-send-plane-fill"></i>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
