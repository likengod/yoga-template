import React from 'react';

interface AdminLoadingSpinnerProps {
  message?: string;
}

const AdminLoadingSpinner = ({ message = 'Loading...' }: AdminLoadingSpinnerProps) => {
  return (
    <div className="text-center py-10 flex flex-col items-center justify-center min-h-[180px] select-none">
      <div className="relative flex items-center justify-center w-12 h-12 mb-3.5">
        {/* Outer glowing spinning ring */}
        <div 
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-yoga-terracotta border-r-yoga-sage animate-spin" 
          style={{ animationDuration: '2.5s' }} 
        />
        {/* Counter-rotating inner ring */}
        <div 
          className="absolute inset-1.5 rounded-full border-2 border-transparent border-b-yoga-forest border-l-yoga-sand animate-spin" 
          style={{ animationDirection: 'reverse', animationDuration: '1.8s' }} 
        />
        {/* Center glowing dot */}
        <div className="w-3 h-3 rounded-full bg-yoga-forest animate-pulse" />
      </div>
      <p className="text-yoga-forest font-playfair font-medium text-sm tracking-wide">{message}</p>
    </div>
  );
};

export default AdminLoadingSpinner;
