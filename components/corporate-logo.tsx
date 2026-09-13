export function CorporateLogo() {
  return (
    <div className="corporate-logo" aria-label="Maristas · Colegio Ntra. Sra. del Carmen - Badajoz">
      <svg viewBox="0 0 720 210" role="img" aria-labelledby="maristas-logo-title" className="h-auto w-full">
        <title id="maristas-logo-title">Maristas · Colegio Ntra. Sra. del Carmen - Badajoz</title>
        <defs>
          <linearGradient id="maristasPink" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f4bad5" />
            <stop offset="55%" stopColor="#d7358b" />
            <stop offset="100%" stopColor="#bd006d" />
          </linearGradient>
        </defs>
        <g transform="translate(10 8)">
          <path d="M54 156 C22 118, 15 80, 31 64 C46 49, 69 67, 91 98 C102 52, 126 12, 151 8 C176 4, 178 44, 168 87 C159 129, 139 169, 117 193 C126 144, 134 103, 132 71 C116 92, 103 118, 94 142 C82 120, 70 102, 57 92 C46 83, 39 88, 42 102 C45 118, 50 137, 54 156 Z" fill="url(#maristasPink)" />
          <g fill="#d7358b">
            <circle cx="176" cy="131" r="9"/><circle cx="164" cy="149" r="7"/><circle cx="153" cy="164" r="5"/>
          </g>
        </g>
        <text x="205" y="117" fill="#11439a" fontSize="78" fontWeight="700" fontFamily="cursive" letterSpacing="-3">maristas</text>
        <text x="210" y="164" fill="#5d5d5d" fontSize="27" fontFamily="Arial, Helvetica, sans-serif">Colegio Ntra. Sra. del Carmen - Badajoz</text>
      </svg>
    </div>
  );
}
