import { Link, useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Navigation() {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  
  const isActive = (path: string) => location === path;
  
  // Navigation items
  const navItems = [
    { path: "/", icon: "ri-home-4-line", label: "Home" },
    { path: "/journal", icon: "ri-psychology-line", label: "Journal" },
    { path: "/meditate", icon: "ri-mental-health-line", label: "Meditate" },
    { path: "/profile", icon: "ri-user-line", label: "Profile" }
  ];

  // Mobile bottom navigation
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-around">
            {navItems.map(item => (
              <Link key={item.path} href={item.path}>
                <span className={`py-3 px-5 flex flex-col items-center ${isActive(item.path) ? 'text-primary-500' : 'text-gray-500'}`}>
                  <i className={`${item.icon} text-xl`}></i>
                  <span className="text-xs mt-1">{item.label}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    );
  }
  
  // Desktop side navigation
  return (
    <nav className="fixed left-0 inset-y-0 w-64 bg-white border-r border-gray-200 shadow-sm z-10 py-6 hidden md:block">
      <div className="flex flex-col h-full">
        <div className="px-6 mb-8">
          <span className="text-primary-500 text-2xl font-bold">Mind<span className="text-accent-400">Journey</span></span>
        </div>
        
        <div className="flex-1 px-3">
          {navItems.map(item => (
            <Link key={item.path} href={item.path}>
              <span className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 cursor-pointer transition-colors ${
                isActive(item.path) 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}>
                <i className={`${item.icon} text-xl`}></i>
                <span className="font-medium">{item.label}</span>
              </span>
            </Link>
          ))}
        </div>
        
        <div className="px-4 mt-auto">
          <div className="border-t border-gray-100 pt-4 px-2">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <i className="ri-user-line text-primary-500"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Alex</p>
                <p className="text-xs text-gray-500">Membre</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
