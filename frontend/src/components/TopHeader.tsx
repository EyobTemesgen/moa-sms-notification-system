import React from 'react';
import { Menu, HelpCircle, Bell, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopHeaderProps {
  onOpenSidebar: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white">
      {/* Left: Hamburger menu */}
      <button
        onClick={onOpenSidebar}
        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        title="Toggle Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Right: Help, Bell with red dot, Profile */}
      <div className="flex items-center space-x-3.5">
        <button
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          title="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </div>

        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div
            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600"
            title={user?.fullName || 'Staff User'}
          >
            <UserIcon className="w-4 h-4 text-slate-500" />
          </div>

          <button
            onClick={logout}
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors text-xs flex items-center gap-1"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
