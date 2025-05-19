import { User } from "@/types";

interface HeaderProps {
  user?: User;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-primary-500 text-2xl font-bold">Mind<span className="text-accent-400">Journey</span></span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <i className="ri-notification-3-line text-gray-600"></i>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <i className="ri-settings-3-line text-gray-600"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
