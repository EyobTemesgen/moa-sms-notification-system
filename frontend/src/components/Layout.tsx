import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

export const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#eef3ec] relative p-3 sm:p-6 lg:p-8 flex items-center justify-center overflow-x-hidden">
      {/* Decorative dark green shape in top right corner (matching mockup) */}
      <div className="absolute top-0 right-0 w-80 h-48 bg-[#0d4722] rounded-bl-[4rem] pointer-events-none -z-0 opacity-90 hidden sm:block" />

      {/* Main App Canvas Card */}
      <div className="w-full max-w-[1400px] bg-white rounded-3xl shadow-2xl border border-slate-200/70 overflow-hidden relative z-10 flex min-h-[820px]">
        {/* Left Side Menu */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Content Body Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <TopHeader onOpenSidebar={() => setIsSidebarOpen(true)} />

          <main className="flex-1 p-6 sm:p-8 bg-[#f9fafb] overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
