import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import Journal from "@/pages/Journal";
import Meditate from "@/pages/Meditate";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { useState } from "react";

// Mock user data (in a real app, this would come from authentication)
const defaultUser = {
  id: 1,
  username: "alex",
  name: "Alex",
};

function App() {
  // In a real app, this would be retrieved from an authentication context
  const [user] = useState(defaultUser);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      <Header user={user} />
      
      <main className="flex-1 container mx-auto px-4 pb-20 pt-6">
        <Switch>
          <Route path="/" component={() => <Home user={user} />} />
          <Route path="/journal" component={() => <Journal user={user} />} />
          <Route path="/meditate" component={() => <Meditate user={user} />} />
          <Route path="/profile" component={() => <Profile user={user} />} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <BottomNavigation />
    </div>
  );
}

export default App;
