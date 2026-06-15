import React from 'react';

export const MobileContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black flex justify-center font-sans antialiased text-slate-200" dir="rtl">
      <div className="w-full max-w-md bg-slate-950 border-x border-slate-900 min-h-screen relative flex flex-col overflow-hidden shadow-sm">
        {children}
      </div>
    </div>
  );
};
