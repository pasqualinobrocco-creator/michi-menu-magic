type Props = {
  variant?: "light" | "dark" | undefined;
  /** Width in px of the logo block */
  width?: number | undefined;
  src?: string | null | undefined;
};

/**
 * Michì brand mark: irregular "cup-stain" gold ring above MICHÍ and
 * CAFFÈ & CUCINA. Falls back to the SVG placeholder when no file is uploaded.
 */
export function MichiLogo({ variant = "light", width = 240, src }: Props) {
  const gold = "#DCA963";
  const ink = variant === "light" ? "#FFFFFF" : "#527879";

  if (src) {
    return (
      <img
        src={src}
        alt="MICHÍ — Caffè & Cucina"
        style={{ width, height: "auto", display: "block" }}
        crossOrigin="anonymous"
      />
    );
  }

  return (
    <svg
      viewBox="0 0 300 200"
      width={width}
      height={(width * 200) / 300}
      role="img"
      aria-label="MICHÍ — Caffè & Cucina"
      style={{ display: "block", overflow: "visible" }}
    >
      <path
        d="M150 14
           C 196 12, 232 34, 238 66
           C 244 98, 220 122, 182 127
           C 144 132, 100 126, 76 106
           C 52 86, 56 52, 84 32
           C 102 19, 124 15, 150 14 Z"
        fill="none"
        stroke={gold}
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeDasharray="230 9 120 7 300"
        opacity="0.95"
      />
      <text
        x="150"
        y="168"
        textAnchor="middle"
        fill={ink}
        style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontSize: "58px",
          fontWeight: 600,
          letterSpacing: "6px",
        }}
      >
        MICHÍ
      </text>
      <text
        x="150"
        y="192"
        textAnchor="middle"
        fill={gold}
        style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontSize: "18px",
          fontWeight: 500,
          letterSpacing: "7px",
        }}
      >
        CAFFÈ &amp; CUCINA
      </text>
    </svg>
  );
}
