import { Link, useLocation } from "wouter";

export default function BottomNavigation() {
  const [location] = useLocation();
  
  const isActive = (path: string) => location === path;
  
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-around">
          <Link href="/">
            <a className={`py-3 px-5 flex flex-col items-center ${isActive('/') ? 'text-primary-500' : 'text-gray-500'}`}>
              <i className="ri-home-4-line text-xl"></i>
              <span className="text-xs mt-1">Home</span>
            </a>
          </Link>
          <Link href="/journal">
            <a className={`py-3 px-5 flex flex-col items-center ${isActive('/journal') ? 'text-primary-500' : 'text-gray-500'}`}>
              <i className="ri-psychology-line text-xl"></i>
              <span className="text-xs mt-1">Journal</span>
            </a>
          </Link>
          <Link href="/meditate">
            <a className={`py-3 px-5 flex flex-col items-center ${isActive('/meditate') ? 'text-primary-500' : 'text-gray-500'}`}>
              <i className="ri-mental-health-line text-xl"></i>
              <span className="text-xs mt-1">Meditate</span>
            </a>
          </Link>
          <Link href="/profile">
            <a className={`py-3 px-5 flex flex-col items-center ${isActive('/profile') ? 'text-primary-500' : 'text-gray-500'}`}>
              <i className="ri-user-line text-xl"></i>
              <span className="text-xs mt-1">Profile</span>
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
}
