import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  fullscreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message,
  subMessage = "Finding balance & inner peace...",
  fullscreen = true,
}) => {
  const [logoUrl, setLogoUrl] = useState<string>('/gorillatechsolution-uploads/001a3e79-c253-4f0f-8842-ed9a57850b57.png');
  const [siteName, setSiteName] = useState<string>('Shakti Yoga Raai');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('siteSettings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.headerLogo) setLogoUrl(parsed.headerLogo);
        if (parsed.siteName) setSiteName(parsed.siteName);
      }
    } catch {}
  }, []);

  const containerClasses = fullscreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#FAF8F5] via-[#F7F4EE] to-[#EFEAE1] px-4 select-none"
    : "flex flex-col items-center justify-center py-12 px-4 select-none";

  return (
    <div className={containerClasses}>
      {/* Ambient background glow */}
      <div 
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-yoga-sage/20 via-yoga-terracotta/15 to-transparent blur-3xl pointer-events-none -z-10 animate-pulse" 
        style={{ animationDuration: '4s' }} 
      />

      {/* Center Sacred Mandala / Logo Container */}
      <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 mb-5">
        {/* Outer glowing spinning ring */}
        <div 
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-yoga-terracotta border-r-yoga-sage/60 animate-spin" 
          style={{ animationDuration: '3s' }} 
        />
        
        {/* Counter-rotating inner ring */}
        <div 
          className="absolute inset-2 rounded-full border-2 border-transparent border-b-yoga-forest border-l-yoga-sand/80 animate-spin" 
          style={{ animationDirection: 'reverse', animationDuration: '2.2s' }} 
        />

        {/* Soft breathing pulse background for the logo */}
        <div className="absolute inset-3.5 rounded-full bg-white/95 backdrop-blur-sm shadow-md flex items-center justify-center overflow-hidden p-2 transition-transform duration-700">
          <img 
            src={logoUrl} 
            alt={siteName} 
            className="w-full h-full object-contain drop-shadow-sm animate-pulse"
            style={{ animationDuration: '2.5s' }}
            onError={(e) => {
              // Graceful Om fallback if logo path isn't loaded
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent && !parent.querySelector('.fallback-om')) {
                const fallback = document.createElement('span');
                fallback.className = 'fallback-om text-yoga-forest font-serif font-bold text-3xl select-none';
                fallback.innerText = 'ॐ';
                parent.appendChild(fallback);
              }
            }}
          />
        </div>
      </div>

      {/* Brand Title */}
      <div className="text-center space-y-1 z-10">
        <h2 className="font-playfair font-bold text-xl sm:text-2xl text-yoga-forest tracking-wide">
          {message || siteName}
        </h2>
        <p className="text-xs sm:text-sm text-yoga-forest/70 font-inter tracking-wider">
          {subMessage}
        </p>
      </div>

      {/* Elegant Breathing Dots */}
      <div className="flex items-center space-x-2 mt-4">
        <span className="w-2 h-2 rounded-full bg-yoga-forest animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-yoga-terracotta animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-yoga-sage animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

export default LoadingScreen;
