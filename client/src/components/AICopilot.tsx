import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { getCBTAnalysis } from "@/lib/openai";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface AICopilotProps {
  user: User;
}

// CBT structured flow steps
enum CBTStep {
  INITIAL = "initial",
  SITUATION = "situation",
  EMOTION = "emotion",
  THOUGHT = "thought",
  CHALLENGE = "challenge",
  REFRAME = "reframe",
  COMPLETE = "complete"
}

// CBT session data
interface CBTSession {
  active: boolean;
  currentStep: CBTStep;
  situation: string;
  emotion: string;
  emotionIntensity?: number;
  thought: string;
  challenge?: string;
  reframe?: string;
}

export default function AICopilot({ user }: AICopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // CBT session state
  const [cbtSession, setCbtSession] = useState<CBTSession>({
    active: false,
    currentStep: CBTStep.INITIAL,
    situation: "",
    emotion: "",
    thought: "",
  });
  
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
          text: `Bonjour ${user.name || "there"}! Je suis votre assistant de bien-être mental. Comment puis-je vous aider aujourd'hui?`,
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
    
    // Save user input based on current CBT step if in active session
    if (cbtSession.active) {
      processCBTResponse(input);
    }
    
    setInput("");
    
    // Simulate AI thinking
    setIsTyping(true);
    
    // Generate response based on session state
    setTimeout(() => {
      if (cbtSession.active) {
        generateNextCBTPrompt();
      } else {
        respondToMessage(input);
      }
      setIsTyping(false);
    }, 1500);
  };
  
  // Process user's response in CBT flow
  const processCBTResponse = (userInput: string) => {
    switch (cbtSession.currentStep) {
      case CBTStep.SITUATION:
        setCbtSession(prev => ({ ...prev, situation: userInput, currentStep: CBTStep.EMOTION }));
        break;
      case CBTStep.EMOTION:
        setCbtSession(prev => ({ ...prev, emotion: userInput, currentStep: CBTStep.THOUGHT }));
        break;
      case CBTStep.THOUGHT:
        setCbtSession(prev => ({ ...prev, thought: userInput, currentStep: CBTStep.CHALLENGE }));
        break;
      case CBTStep.CHALLENGE:
        setCbtSession(prev => ({ ...prev, challenge: userInput, currentStep: CBTStep.REFRAME }));
        break;
      case CBTStep.REFRAME:
        setCbtSession(prev => ({ ...prev, reframe: userInput, currentStep: CBTStep.COMPLETE }));
        // Here we would save the complete CBT entry
        saveCBTJournalEntry();
        break;
    }
  };
  
  // Generate the next prompt in the CBT flow
  const generateNextCBTPrompt = async () => {
    let response = "";
    
    switch (cbtSession.currentStep) {
      case CBTStep.INITIAL:
        response = "D'accord, commençons notre exercice de restructuration des pensées. Décrivez d'abord brièvement la situation qui vous préoccupe.";
        setCbtSession(prev => ({ ...prev, currentStep: CBTStep.SITUATION }));
        break;
      
      case CBTStep.SITUATION:
        response = "Quelles émotions ressentez-vous face à cette situation? (Par exemple: anxiété, tristesse, colère, frustration...)";
        break;
      
      case CBTStep.EMOTION:
        response = "Quelles pensées ou croyances vous traversent l'esprit dans cette situation?";
        break;
      
      case CBTStep.THOUGHT:
        // Analyse AI pour identifier le modèle de pensée et suggérer des défis
        try {
          setIsTyping(true);
          
          const aiAnalysis = await getCBTAnalysis(
            cbtSession.situation,
            cbtSession.emotion,
            cbtSession.thought
          );
          
          response = `J'ai analysé votre pensée et elle semble correspondre au schéma de "${aiAnalysis.thoughtPattern}". ${aiAnalysis.patternExplanation}\n\nVoici comment nous pourrions la remettre en question: ${aiAnalysis.challenge}\n\nQu'en pensez-vous? Pouvez-vous ajouter votre propre remise en question de cette pensée?`;
        } catch (error) {
          console.error("Error analyzing thoughts:", error);
          response = "Essayons maintenant de remettre en question cette pensée. Quelles preuves avez-vous que cette pensée est vraie ou fausse? Y a-t-il d'autres façons de voir la situation?";
        }
        break;
      
      case CBTStep.CHALLENGE:
        response = "Maintenant, essayons de reformuler votre pensée initiale de manière plus équilibrée et réaliste. Quelle serait une perspective alternative plus aidante?";
        break;
      
      case CBTStep.REFRAME:
        response = "Excellent travail! Vous avez complété l'exercice de restructuration des pensées. Comment vous sentez-vous maintenant par rapport à cette situation?";
        break;
      
      case CBTStep.COMPLETE:
        response = "Votre exercice de restructuration des pensées a été enregistré dans votre journal. Vous pouvez le consulter à tout moment. Souhaitez-vous explorer autre chose?";
        // Reset CBT session
        setCbtSession({
          active: false,
          currentStep: CBTStep.INITIAL,
          situation: "",
          emotion: "",
          thought: ""
        });
        break;
    }
    
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: response,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
  };
  
  // Save the complete CBT journal entry
  const saveCBTJournalEntry = async () => {
    try {
      await apiRequest("POST", "/api/journal", {
        userId: user.id,
        situation: cbtSession.situation,
        emotion: cbtSession.emotion,
        thought: cbtSession.thought,
        challenge: cbtSession.challenge,
        reframe: cbtSession.reframe
      });
      
      // Success message is handled in the COMPLETE step
    } catch (error) {
      console.error("Error saving journal entry:", error);
      
      const errorMessage: Message = {
        id: `ai-error-${Date.now()}`,
        sender: "ai",
        text: "Désolé, j'ai rencontré un problème lors de l'enregistrement de votre entrée de journal. Veuillez réessayer plus tard.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };
  
  const respondToMessage = (userInput: string) => {
    // Détection des intentions et génération de réponses
    let response = "";
    
    const lowerInput = userInput.toLowerCase();
    
    // Check if user wants to start CBT exercise
    if (lowerInput.includes("pensée") || lowerInput.includes("restructur") || 
        lowerInput.includes("cbt") || lowerInput.includes("tcc") || 
        lowerInput.includes("pensees négatives") || lowerInput.includes("exercice")) {
      
      setCbtSession(prev => ({ ...prev, active: true, currentStep: CBTStep.INITIAL }));
      response = "Je serais ravi de vous guider à travers un exercice de restructuration des pensées. Cela vous aidera à identifier et transformer vos pensées négatives. Êtes-vous prêt à commencer?";
      
    } else if (lowerInput.includes("anxieux") || lowerInput.includes("anxiété") || lowerInput.includes("stress")) {
      response = "Je comprends à quel point l'anxiété peut être accablante. Souhaitez-vous essayer un exercice rapide de respiration pour vous aider à calmer vos nerfs, ou préférez-vous parler davantage de ce qui cause votre anxiété?";
      
    } else if (lowerInput.includes("triste") || lowerInput.includes("déprimé")) {
      response = "Je suis désolé d'apprendre que vous vous sentez mal. Rappelez-vous que les émotions sont temporaires et qu'il est normal de se sentir triste parfois. Voulez-vous parler de ce qui contribue à ces sentiments?";
      
    } else if (lowerInput.includes("stressé") || lowerInput.includes("débordé")) {
      response = "Quand vous vous sentez stressé, il peut être utile de décomposer les choses en tâches plus petites et gérables. Souhaitez-vous des techniques pour gérer le stress, ou préférez-vous explorer ce qui cause ce sentiment?";
      
    } else if (lowerInput.includes("respiration") || lowerInput.includes("respirer")) {
      response = "Les exercices de respiration peuvent vraiment aider! Essayez la technique 4-7-8: Inspirez pendant 4 secondes, retenez pendant 7 secondes, puis expirez pendant 8 secondes. Répétez cela 4 fois et remarquez comment votre corps se sent.";
      
    } else if (lowerInput.includes("méditation") || lowerInput.includes("méditer")) {
      response = "La méditation est une excellente pratique pour le bien-être mental. L'application propose plusieurs méditations guidées. Voulez-vous que je vous en recommande une en fonction de ce que vous ressentez?";
      
    } else if (lowerInput.includes("bonjour") || lowerInput.includes("salut")) {
      response = `Bonjour ${user.name || "there"}! Comment vous sentez-vous aujourd'hui? Je suis là pour soutenir votre parcours de bien-être mental.`;
      
    } else if (lowerInput.includes("obiectif") || lowerInput.includes("but")) {
      response = "Fixer des objectifs est une excellente façon de progresser. Voulez-vous que je vous aide à définir un objectif de bien-être et à élaborer un plan pour l'atteindre?";
      
    } else {
      response = "Merci de partager. Voulez-vous explorer cela plus en détail, ou peut-être essayer l'un de nos exercices comme la respiration, la méditation ou la restructuration des pensées?";
    }
    
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: response,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
    
    // If starting CBT flow, proceed to first prompt
    if (cbtSession.active && cbtSession.currentStep === CBTStep.INITIAL) {
      setTimeout(() => {
        generateNextCBTPrompt();
      }, 1500);
    }
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
                  Coach Mental IA
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
                  placeholder="Écrivez votre message..."
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
