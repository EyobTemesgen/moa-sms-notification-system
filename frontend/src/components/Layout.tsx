import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

export const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Side Menu */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area (offset by sidebar width on large screens) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <TopHeader onOpenSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 px-4 sm:px-8 py-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <footer className="border-t border-slate-200/80 bg-white/70 py-4 px-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            <strong>Federal Democratic Republic of Ethiopia</strong> &bull; Ministry of Agriculture (MOA)
          </div>
          <div className="text-[11px] text-slate-700">
            Internal On-Premise SMS Gateway &bull; High-Value Payment Monitoring System &copy; 2026
          </div>
        </footer>
      </div>
    </div>
  );
};
