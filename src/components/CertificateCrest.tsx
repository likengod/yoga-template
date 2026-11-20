import React from 'react';

interface CertificateCrestProps {
  schoolName?: string;
  subTitle?: string;
  bannerText?: string;
  domain?: string;
  className?: string;
}

function parseSchoolTitle(rawName?: string, explicitSubtitle?: string) {
  if (explicitSubtitle !== undefined && explicitSubtitle !== '') {
    return { line1: (rawName || '').toUpperCase(), line2: explicitSubtitle.toUpperCase() };
  }
  const clean = (rawName || 'Shakti Yoga RaaiKtha').trim();
  const words = clean.split(/\s+/);
  if (words.length <= 1) {
    return { line1: words[0].toUpperCase(), line2: '' };
  }
  if (words.length === 2) {
    return { line1: words[0].toUpperCase(), line2: words[1].toUpperCase() };
  }

  // Find optimal split point that balances lengths of the two lines
  let bestIdx = 1;
  let minDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const l1 = words.slice(0, i).join(' ');
    const l2 = words.slice(i).join(' ');
    const diff = Math.abs(l1.length - l2.length);
    if (diff < minDiff) {
      minDiff = diff;
      bestIdx = i;
    }
  }
  return {
    line1: words.slice(0, bestIdx).join(' ').toUpperCase(),
    line2: words.slice(bestIdx).join(' ').toUpperCase()
  };
}

export const CertificateCrest: React.FC<CertificateCrestProps> = ({
  schoolName,
  subTitle,
  bannerText = 'OFFICIAL ACCREDITED',
  domain = 'SHAKTIYOGARAAI.COM',
  className = 'w-56 sm:w-64 md:w-72 aspect-[400/275]'
}) => {
  const { line1, line2 } = parseSchoolTitle(schoolName, subTitle);

  // Clean domain: strip www., protocol, and trailing paths so it only shows websitename.com/in
  const cleanDomain = React.useMemo(() => {
    let d = (domain || 'SHAKTIYOGARAAI.COM').trim();
    d = d.replace(/^https?:\/\//i, '');
    d = d.replace(/^www\./i, '');
    d = d.replace(/\/.*$/, '');
    return d.toUpperCase();
  }, [domain]);

  // Dynamic proportional font sizing so text never touches or crowds the laurel wreath
  const getLine1FontSize = (len: number) => {
    if (len <= 6) return '26px';
    if (len <= 11) return '22px';
    if (len <= 16) return '18px';
    if (len <= 20) return '15px';
    return '13px';
  };

  const getLine2FontSize = (len: number) => {
    if (len <= 7) return '16px';
    if (len <= 12) return '14px';
    if (len <= 16) return '12.5px';
    if (len <= 20) return '11px';
    return '10px';
  };

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox="0 0 400 275"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm overflow-visible"
      >
        <defs>
          {/* Leaf Light Gradient (Sunlit Face) */}
          <linearGradient id="leafLightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff6c4" />
            <stop offset="30%" stopColor="#f5ce5f" />
            <stop offset="70%" stopColor="#dd9f25" />
            <stop offset="100%" stopColor="#b37a11" />
          </linearGradient>

          {/* Leaf Shadow Gradient (Depth/Shaded Face) */}
          <linearGradient id="leafDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#cfa029" />
            <stop offset="40%" stopColor="#9e6d0a" />
            <stop offset="85%" stopColor="#754c03" />
            <stop offset="100%" stopColor="#543301" />
          </linearGradient>

          {/* Stem Metallic Gradient */}
          <linearGradient id="stemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f5ce5f" />
            <stop offset="50%" stopColor="#b57e14" />
            <stop offset="100%" stopColor="#6e4604" />
          </linearGradient>

          {/* Berry Golden Radial Gradient */}
          <radialGradient id="berryGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fff3a8" />
            <stop offset="60%" stopColor="#dfa428" />
            <stop offset="100%" stopColor="#7a4f07" />
          </radialGradient>

          {/* Ribbon Front Face Metallic Gradient */}
          <linearGradient id="ribbonFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff7cb" />
            <stop offset="15%" stopColor="#f8d86a" />
            <stop offset="55%" stopColor="#d99f24" />
            <stop offset="88%" stopColor="#b37711" />
            <stop offset="100%" stopColor="#7a4b04" />
          </linearGradient>

          {/* Ribbon Tail Gradient */}
          <linearGradient id="ribbonTailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#edd076" />
            <stop offset="50%" stopColor="#b5821c" />
            <stop offset="100%" stopColor="#694306" />
          </linearGradient>

          {/* Ribbon Deep Underfold Shadow */}
          <linearGradient id="ribbonFoldShadow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2e1901" />
            <stop offset="60%" stopColor="#452703" />
            <stop offset="100%" stopColor="#1f1000" />
          </linearGradient>

          {/* Gold Star Radial Gradient */}
          <radialGradient id="starGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#fff09c" />
            <stop offset="75%" stopColor="#dca529" />
            <stop offset="100%" stopColor="#8c5b08" />
          </radialGradient>

          {/* Plump 3D Laurel Leaf Master Definition */}
          {/* Origin at (0, 0), tip at (0, -28), width ~13px */}
          <g id="plumpLeaf">
            {/* Shaded/Dark Half */}
            <path
              d="M 0,0 C 6.5,-7 6.5,-18 0,-28 C 1,-18 1,-7 0,0 Z"
              fill="url(#leafDarkGrad)"
            />
            {/* Highlighted/Sunlit Half */}
            <path
              d="M 0,0 C -6.5,-7 -6.5,-18 0,-28 C -1,-18 -1,-7 0,0 Z"
              fill="url(#leafLightGrad)"
            />
            {/* Golden Center Vein Highlight */}
            <line x1="0" y1="-1" x2="0" y2="-27" stroke="#fff8b8" strokeWidth="0.75" strokeLinecap="round" opacity="0.9" />
            {/* Outer Subtle Leaf Edge Outline for Definition */}
            <path
              d="M 0,0 C 6.5,-7 6.5,-18 0,-28 C -6.5,-18 -6.5,-7 0,0 Z"
              stroke="#6b4202"
              strokeWidth="0.4"
              fill="none"
              opacity="0.4"
            />
          </g>

          {/* Balanced Leaf Cluster: outer leaf swept outward, inner leaf gently hugging stem */}
          <g id="leafCluster">
            {/* Outer leaf (swept outward away from center) */}
            <g transform="rotate(-34) scale(1.04)">
              <use href="#plumpLeaf" />
            </g>
            {/* Center leaf (aligned with tangent) */}
            <g transform="translate(0, -5) rotate(-10) scale(0.96)">
              <use href="#plumpLeaf" />
            </g>
            {/* Inner leaf (hugs branch contour closely without intruding into text zone) */}
            <g transform="rotate(10) scale(0.82)">
              <use href="#plumpLeaf" />
            </g>
            {/* Golden Berries at stem base */}
            <circle cx="-1" cy="-2" r="2.0" fill="url(#berryGrad)" stroke="#6b4202" strokeWidth="0.3" />
            <circle cx="3" cy="-4" r="1.6" fill="url(#berryGrad)" stroke="#6b4202" strokeWidth="0.3" />
          </g>

          {/* Centered Path for Ribbon Inscription Curvature */}
          {/* Sits at vertical center of banner */}
          <path id="ribbonArcCentered" d="M 98,198 Q 200,183 302,198" fill="none" />

          {/* Wider Symmetrical Laurel Branch: provides generous ~175px central clearance */}
          <g id="wideLeftBranch">
            {/* Stem shadow */}
            <path
              d="M 165,190 C 74,172 58,60 142,22"
              stroke="url(#leafDarkGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Stem highlight */}
            <path
              d="M 164,189 C 75,171 59,61 142,23"
              stroke="url(#stemGrad)"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />

            {/* Cluster 1: Base near ribbon */}
            <g transform="translate(145, 184) rotate(-158) scale(0.95)">
              <use href="#leafCluster" />
            </g>

            {/* Cluster 2 */}
            <g transform="translate(120, 169) rotate(-141) scale(1.02)">
              <use href="#leafCluster" />
            </g>

            {/* Cluster 3 */}
            <g transform="translate(100, 147) rotate(-122) scale(1.06)">
              <use href="#leafCluster" />
            </g>

            {/* Cluster 4: Mid-height curve */}
            <g transform="translate(90, 122) rotate(-104) scale(1.08)">
              <use href="#leafCluster" />
            </g>

            {/* Cluster 5: Mid-upper curve */}
            <g transform="translate(88, 92) rotate(-84) scale(1.06)">
              <use href="#leafCluster" />
            </g>

            {/* Cluster 6: Upper curve */}
            <g transform="translate(95, 66) rotate(-64) scale(1.00)">
              <use href="#leafCluster" />
            </g>

            {/* Cluster 7: Near top */}
            <g transform="translate(112, 42) rotate(-45) scale(0.90)">
              <use href="#leafCluster" />
            </g>

            {/* Cluster 8: Apex top tip */}
            <g transform="translate(137, 24) rotate(-27) scale(0.82)">
              <g transform="rotate(-15)">
                <use href="#plumpLeaf" />
              </g>
              <g transform="translate(3, -6) rotate(14) scale(0.85)">
                <use href="#plumpLeaf" />
              </g>
              <circle cx="1" cy="-3" r="1.8" fill="url(#berryGrad)" />
            </g>
          </g>
        </defs>

        {/* 1. LEFT LAUREL WREATH BRANCH (Generously spaced, lush golden leaves) */}
        <use href="#wideLeftBranch" />

        {/* 2. RIGHT LAUREL WREATH BRANCH (Exact mathematical mirror reflection) */}
        <use href="#wideLeftBranch" transform="translate(400, 0) scale(-1, 1)" />

        {/* 3. CENTER INSCRIPTION */}
        {line2 ? (
          <>
            {/* Line 1 (e.g. SHAKTI YOGA) */}
            <text
              x="200"
              y="82"
              textAnchor="middle"
              fill="#1b3960"
              style={{
                fontFamily: "'Cinzel', 'Playfair Display', serif",
                fontSize: getLine1FontSize(line1.length),
                fontWeight: 900,
                letterSpacing: '0.12em'
              }}
            >
              {line1}
            </text>

            {/* Line 2 (e.g. RAAIKTHA) */}
            <text
              x="200"
              y="106"
              textAnchor="middle"
              fill="#1e3e68"
              style={{
                fontFamily: "'Cinzel', 'Montserrat', serif",
                fontSize: getLine2FontSize(line2.length),
                fontWeight: 800,
                letterSpacing: '0.22em'
              }}
            >
              {line2}
            </text>
          </>
        ) : (
          /* Single Line Title */
          <text
            x="200"
            y="94"
            textAnchor="middle"
            fill="#1b3960"
            style={{
              fontFamily: "'Cinzel', 'Playfair Display', serif",
              fontSize: getLine1FontSize(line1.length),
              fontWeight: 900,
              letterSpacing: '0.14em'
            }}
          >
            {line1}
          </text>
        )}

        {/* Triple Gold Diamond Stars (✦  ✦  ✦) */}
        <g transform={`translate(200, ${line2 ? 125 : 118})`}>
          {/* Center 8-point Gold Star Diamond */}
          <polygon points="0,-8 2,-2 8,0 2,2 0,8 -2,2 -8,0 -2,-2" fill="url(#starGrad)" />
          <circle cx="0" cy="0" r="1.4" fill="#ffffff" />

          {/* Left Star Diamond */}
          <polygon points="-18,-4.5 -16,-1.4 -12,0 -16,1.4 -18,4.5 -20,1.4 -24,0 -20,-1.4" fill="url(#starGrad)" />
          <circle cx="-18" cy="0" r="1.0" fill="#ffffff" />

          {/* Right Star Diamond */}
          <polygon points="18,-4.5 20,-1.4 24,0 20,1.4 18,4.5 16,1.4 12,0 16,-1.4" fill="url(#starGrad)" />
          <circle cx="18" cy="0" r="1.0" fill="#ffffff" />

          {/* Fine Accent Lines */}
          <line x1="-36" y1="0" x2="-26" y2="0" stroke="url(#stemGrad)" strokeWidth="0.9" strokeLinecap="round" />
          <line x1="26" y1="0" x2="36" y2="0" stroke="url(#stemGrad)" strokeWidth="0.9" strokeLinecap="round" />
        </g>

        {/* 4. REALISTIC 3D GOLDEN CURVED RIBBON BANNER */}
        <g id="ribbonBanner">
          {/* Left Ribbon Tail (Behind) */}
          <path
            d="M 98,188 L 48,193 L 64,207 L 46,222 L 98,216 Z"
            fill="url(#ribbonTailGrad)"
            stroke="#633e03"
            strokeWidth="0.75"
          />
          {/* Left Underfold Shadow (Fold beneath main banner) */}
          <polygon points="98,188 98,216 116,204" fill="url(#ribbonFoldShadow)" />

          {/* Right Ribbon Tail (Behind) */}
          <path
            d="M 302,188 L 352,193 L 336,207 L 354,222 L 302,216 Z"
            fill="url(#ribbonTailGrad)"
            stroke="#633e03"
            strokeWidth="0.75"
          />
          {/* Right Underfold Shadow (Fold beneath main banner) */}
          <polygon points="302,188 302,216 284,204" fill="url(#ribbonFoldShadow)" />

          {/* Main Front Curved Banner Body */}
          <path
            d="M 96,186 Q 200,171 304,186 L 304,214 Q 200,199 96,214 Z"
            fill="url(#ribbonFrontGrad)"
            stroke="#633e03"
            strokeWidth="0.9"
            style={{ filter: 'drop-shadow(0px 3px 5px rgba(60, 35, 2, 0.28))' }}
          />

          {/* Top Gold Embossed Highlight Edge */}
          <path
            d="M 98,188 Q 200,173 302,188"
            stroke="#fffbe0"
            strokeWidth="1.1"
            fill="none"
          />

          {/* Bottom Gold Embossed Shadow Edge */}
          <path
            d="M 98,212 Q 200,197 302,212"
            stroke="#5c3802"
            strokeWidth="1.0"
            fill="none"
          />

          {/* Ribbon Text (Perfect vertical center along the ribbon curve) */}
          <text
            fill="#3d2201"
            style={{
              fontFamily: "'Montserrat', 'Cinzel', sans-serif",
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing: '0.15em',
              textShadow: '0 1px 0 rgba(255, 255, 255, 0.85)'
            }}
          >
            <textPath href="#ribbonArcCentered" startOffset="50%" textAnchor="middle">
              {bannerText}
            </textPath>
          </text>
        </g>

        {/* 5. DOMAIN NAME (SHAKTIYOGARAAI.COM) */}
        <g transform="translate(0, 8)">
          {/* Left Wing Pinstripe */}
          <line x1="66" y1="238" x2="114" y2="238" stroke="#a3b8cc" strokeWidth="1" strokeLinecap="round" />
          <circle cx="118" cy="238" r="1.5" fill="#1b3960" />

          {/* Domain Text */}
          <text
            x="200"
            y="242"
            textAnchor="middle"
            fill="#1e3e68"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.28em'
            }}
          >
            {cleanDomain}
          </text>

          {/* Right Wing Pinstripe */}
          <circle cx="282" cy="238" r="1.5" fill="#1b3960" />
          <line x1="286" y1="238" x2="334" y2="238" stroke="#a3b8cc" strokeWidth="1" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};

export default CertificateCrest;
