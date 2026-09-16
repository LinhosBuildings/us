export function BearCoupleHug() {
  return (
    <div className="bear-couple-stage">
      <svg viewBox="0 0 360 320" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <ellipse cx="180" cy="290" rx="120" ry="14" fill="#e8c9a0" opacity="0.5" />
        <g className="bear-left">
          <ellipse cx="130" cy="235" rx="58" ry="55" fill="#b5804d" />
          <ellipse cx="130" cy="248" rx="34" ry="30" fill="#eecda3" />
          <ellipse cx="178" cy="230" rx="16" ry="26" fill="#b5804d" transform="rotate(20 178 230)" />
          <ellipse cx="105" cy="285" rx="18" ry="12" fill="#b5804d" />
          <ellipse cx="155" cy="285" rx="18" ry="12" fill="#b5804d" />
          <circle cx="150" cy="160" r="52" fill="#b5804d" />
          <circle cx="112" cy="120" r="18" fill="#b5804d" />
          <circle cx="112" cy="120" r="9" fill="#eecda3" />
          <circle cx="185" cy="118" r="18" fill="#b5804d" />
          <circle cx="185" cy="118" r="9" fill="#eecda3" />
          <ellipse cx="163" cy="175" rx="26" ry="20" fill="#eecda3" />
          <ellipse cx="168" cy="170" rx="4" ry="3" fill="#5c3d24" />
          <path d="M155 178 Q163 186 172 178" stroke="#5c3d24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M127 152 Q136 144 145 152" stroke="#4a3018" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="120" cy="168" rx="9" ry="6" fill="#f4a488" opacity="0.6" />
        </g>
        <g className="bear-right">
          <ellipse cx="230" cy="235" rx="58" ry="55" fill="#fbf3e6" />
          <ellipse cx="230" cy="248" rx="34" ry="30" fill="#fffdf8" />
          <ellipse cx="182" cy="230" rx="16" ry="26" fill="#fbf3e6" transform="rotate(-20 182 230)" />
          <ellipse cx="205" cy="285" rx="18" ry="12" fill="#fbf3e6" />
          <ellipse cx="255" cy="285" rx="18" ry="12" fill="#fbf3e6" />
          <circle cx="210" cy="160" r="52" fill="#fbf3e6" />
          <circle cx="175" cy="118" r="18" fill="#fbf3e6" />
          <circle cx="175" cy="118" r="9" fill="#ffd9d2" />
          <circle cx="248" cy="120" r="18" fill="#fbf3e6" />
          <circle cx="248" cy="120" r="9" fill="#ffd9d2" />
          <ellipse cx="197" cy="175" rx="26" ry="20" fill="#fffdf8" />
          <ellipse cx="192" cy="170" rx="4" ry="3" fill="#7a6a5a" />
          <path d="M188 178 Q197 186 205 178" stroke="#7a6a5a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M215 152 Q224 144 233 152" stroke="#6b5a4a" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="238" cy="168" rx="9" ry="6" fill="#ffb3ad" opacity="0.6" />
        </g>
        <text x="180" y="95" fontSize="34" textAnchor="middle" className="heart">💗</text>
      </svg>
    </div>
  );
}