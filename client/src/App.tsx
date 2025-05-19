import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import Journal from "@/pages/Journal";
import Meditate from "@/pages/Meditate";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Navigation from "@/components/BottomNavigation";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

// Mock user data (in a real app, this would come from authentication)
const defaultUser = {
  id: 1,
  username: "alex",
  name: "Alex",
};

function App() {
  // In a real app, this would be retrieved from an authentication context
  const [user] = useState(defaultUser);
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      {isMobile && <Header user={user} />}
      
      <div className="flex flex-1">
        <Navigation />
        
        <main className={`flex-1 pb-20 pt-6 ${isMobile ? 'px-4' : 'ml-64 px-8'}`}>
          <div className={`${isMobile ? 'container mx-auto' : 'max-w-4xl mx-auto'}`}>
            <Switch>
              <Route path="/" component={() => <Home user={user} />} />
              <Route path="/journal" component={() => <Journal user={user} />} />
              <Route path="/meditate" component={() => <Meditate user={user} />} />
              <Route path="/profile" component={() => <Profile user={user} />} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
