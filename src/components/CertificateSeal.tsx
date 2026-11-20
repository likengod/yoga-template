import React from 'react';

interface CertificateSealProps {
  isPremium?: boolean;
  showIsoBadge?: boolean;
  customIsoImage?: string;
  className?: string;
}

export const CertificateSeal: React.FC<CertificateSealProps> = ({
  isPremium = false,
  showIsoBadge = false,
  customIsoImage,
  className = 'w-20 h-20'
}) => {
  const displayIso = isPremium || showIsoBadge;

  // 1. If custom ISO image is configured and certificate is premium
  if (displayIso && customIsoImage) {
    return (
      <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
        <img
          src={customIsoImage}
          alt="ISO 9001:2015 Certified"
          className="w-full h-full object-contain filter drop-shadow-md"
        />
      </div>
    );
  }

  // 2. If certificate is premium: Show authentic, prestigious ISO 9001:2015 Badge
  if (displayIso) {
    return (
      <div className={`relative flex flex-col items-center justify-end select-none ${className}`}>
        {/* Ribbon tails below ISO badge */}
        <div className="absolute -bottom-2 flex gap-1 z-0 pointer-events-none">
          <div
            className="w-4 h-9 bg-gradient-to-b from-[#1e3a5f] to-[#0f1d30] transform rotate-[16deg] origin-top-right shadow-sm border-r border-[#d4af37]"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)' }}
          />
          <div
            className="w-4 h-9 bg-gradient-to-b from-[#1e3a5f] to-[#0f1d30] transform -rotate-[16deg] origin-top-left shadow-sm border-l border-[#d4af37]"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)' }}
          />
        </div>

        {/* Official ISO 9001:2015 Medallion */}
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full relative z-10 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)] overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="isoGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff6c4" />
              <stop offset="25%" stopColor="#f5ce5f" />
              <stop offset="50%" stopColor="#c48e1b" />
              <stop offset="75%" stopColor="#fae482" />
              <stop offset="100%" stopColor="#7a4f04" />
            </linearGradient>

            <linearGradient id="isoNavyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e3e68" />
              <stop offset="50%" stopColor="#132845" />
              <stop offset="100%" stopColor="#0b1728" />
            </linearGradient>

            <radialGradient id="isoInnerLight" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#fef2b8" />
              <stop offset="70%" stopColor="#e5b238" />
              <stop offset="100%" stopColor="#9c6d0c" />
            </radialGradient>

            <path id="isoTopArc" d="M 18,60 A 42,42 0 0,1 102,60" fill="none" />
            <path id="isoBottomArc" d="M 102,60 A 42,42 0 0,1 18,60" fill="none" />
          </defs>

          {/* Outer Scalloped Sunburst Teeth */}
          <g transform="translate(60,60)">
            {Array.from({ length: 36 }).map((_, i) => (
              <polygon
                key={i}
                points="-2.8,-58 0,-60 2.8,-58 1.8,-54 -1.8,-54"
                fill="url(#isoGoldGrad)"
                transform={`rotate(${i * 10})`}
              />
            ))}
          </g>

          {/* Outer Gold Rim */}
          <circle cx="60" cy="60" r="54" fill="url(#isoGoldGrad)" stroke="#6b4202" strokeWidth="0.8" />

          {/* Deep Navy Ring */}
          <circle cx="60" cy="60" r="49" fill="url(#isoNavyGrad)" stroke="#ffd768" strokeWidth="1" />

          {/* Inner Beaded Border */}
          <circle cx="60" cy="60" r="35" fill="none" stroke="#fae482" strokeWidth="0.8" strokeDasharray="1.5 1.5" />

          {/* Top Arc Text: ISO 9001 : 2015 */}
          <text
            fill="#fff8d1"
            style={{
              fontFamily: "'Cinzel', 'Montserrat', sans-serif",
              fontSize: '8px',
              fontWeight: 900,
              letterSpacing: '0.14em',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)'
            }}
          >
            <textPath href="#isoTopArc" startOffset="50%" textAnchor="middle">
              ★ ISO 9001 : 2015 ★
            </textPath>
          </text>

          {/* Bottom Arc Text: CERTIFIED ORGANIZATION */}
          <text
            fill="#ffd966"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '5.8px',
              fontWeight: 800,
              letterSpacing: '0.18em'
            }}
          >
            <textPath href="#isoBottomArc" startOffset="50%" textAnchor="middle">
              CERTIFIED ORGANIZATION
            </textPath>
          </text>

          {/* Center Inner Gold Medallion */}
          <circle cx="60" cy="60" r="31" fill="url(#isoInnerLight)" stroke="#6e4604" strokeWidth="0.9" />
          <circle cx="60" cy="60" r="29" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.8" />

          {/* Large Bold "ISO" */}
          <text
            x="60"
            y="54"
            textAnchor="middle"
            fill="#122744"
            style={{
              fontFamily: "'Cinzel', 'Playfair Display', serif",
              fontSize: '15px',
              fontWeight: 900,
              letterSpacing: '0.12em'
            }}
          >
            ISO
          </text>

          {/* "9001:2015" */}
          <text
            x="60"
            y="65"
            textAnchor="middle"
            fill="#2c1a01"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '8px',
              fontWeight: 900,
              letterSpacing: '0.12em'
            }}
          >
            9001:2015
          </text>

          {/* Quality Certified Ribbon/Stars Accent */}
          <g transform="translate(60, 72)">
            <path
              d="M -16,-2 L -12,2 L 12,2 L 16,-2 L 14,5 L -14,5 Z"
              fill="url(#isoNavyGrad)"
              stroke="#dfa428"
              strokeWidth="0.5"
            />
            <text
              x="0"
              y="3.5"
              textAnchor="middle"
              fill="#fff8d1"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '4.2px',
                fontWeight: 800,
                letterSpacing: '0.14em'
              }}
            >
              CERTIFIED
            </text>
          </g>
        </svg>
      </div>
    );
  }

  // 3. If standard certificate (Non-Premium): Do not show any seal/badge
  return null;
};

export default CertificateSeal;
