import { useLayoutEffect, useRef } from "react";

import { MichiLogo } from "@/components/MichiLogo";
import { formatPrice, type GraphicGroup } from "@/lib/menu";

export const FORMATS = {
  story: { key: "story", label: "Storia / Reel", w: 1080, h: 1920 },
  square: { key: "square", label: "Post quadrato", w: 1080, h: 1080 },
  portrait: { key: "portrait", label: "Post verticale", w: 1080, h: 1350 },
} as const;

export type FormatKey = keyof typeof FORMATS;

export type CanvasData = {
  dateLabel?: string | undefined;
  title?: string | undefined;
  groups: GraphicGroup[];
  bread?: string | undefined;
  closing?: string | undefined;
  logoSrc?: string | null | undefined;
};

type Props = CanvasData & {
  format: FormatKey;
  /** rendered display width in px; the node itself is always 1080 wide */
  displayWidth?: number | undefined;
  nodeRef?: React.RefObject<HTMLDivElement | null> | undefined;
};

export function MenuCanvas({
  format,
  displayWidth,
  nodeRef,
  dateLabel,
  title,
  groups,
  bread,
  closing,
  logoSrc,
}: Props) {
  const f = FORMATS[format];
  const innerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const localNode = useRef<HTMLDivElement>(null);
  const node = nodeRef ?? localNode;

  const base = f.h * 0.032;
  const visibleGroups = groups.filter((g) => g.lines.length > 0);

  // Shrink the type until everything fits inside the format, never cropping.
  useLayoutEffect(() => {
    const el = innerRef.current;
    const box = boxRef.current;
    if (!el || !box) return;
    const fits = (px: number) => {
      el.style.fontSize = `${px}px`;
      return el.scrollHeight <= box.clientHeight;
    };
    if (fits(base)) return;
    let lo = base * 0.3;
    let hi = base;
    for (let i = 0; i < 16; i++) {
      const mid = (lo + hi) / 2;
      if (fits(mid)) lo = mid;
      else hi = mid;
    }
    fits(lo);
  });

  const scale = displayWidth ? displayWidth / f.w : 1;

  return (
    <div
      style={{
        width: displayWidth ?? f.w,
        height: (displayWidth ? f.h * scale : f.h) || f.h,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: f.w,
          height: f.h,
        }}
      >
        <div
          ref={node}
          style={{
            width: f.w,
            height: f.h,
            backgroundColor: "#527879",
            color: "#FFFFFF",
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: `${f.h * 0.045}px ${f.w * 0.085}px`,
            boxSizing: "border-box",
          }}
        >
          <div
            ref={boxRef}
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <div
              ref={innerRef}
              style={{
                width: "100%",
                textAlign: "center",
                fontSize: base,
                lineHeight: 1.45,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "1.1em",
                }}
              >
                <MichiLogo variant="light" width={f.w * 0.42} src={logoSrc} />
              </div>

              {title ? (
                <div
                  style={{
                    fontWeight: 600,
                    letterSpacing: "0.22em",
                    fontSize: "1.15em",
                    marginBottom: "0.5em",
                  }}
                >
                  {title}
                </div>
              ) : null}

              {dateLabel ? (
                <div
                  style={{
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    marginBottom: "1.1em",
                  }}
                >
                  {dateLabel}
                </div>
              ) : null}

              {visibleGroups.map((group, gi) => (
                <div key={gi}>
                  {gi > 0 ? (
                    <div style={{ margin: "0.55em 0", opacity: 0.9 }}>•</div>
                  ) : null}
                  {group.label ? (
                    <div
                      style={{
                        fontSize: "0.72em",
                        letterSpacing: "0.3em",
                        opacity: 0.85,
                        marginBottom: "0.35em",
                      }}
                    >
                      {group.label.toUpperCase()}
                    </div>
                  ) : null}
                  {group.lines.map((line, li) => (
                    <div
                      key={li}
                      style={{
                        margin: "0.12em auto",
                        maxWidth: "94%",
                        textWrap: "balance",
                      }}
                    >
                      <span>• {line.name}</span>
                      {line.description ? (
                        <span style={{ fontStyle: "italic", opacity: 0.85 }}>
                          {" "}
                          {line.description}
                        </span>
                      ) : null}
                      {line.price !== null && line.price !== undefined ? (
                        <span style={{ fontWeight: 700 }}>
                          {" "}
                          {formatPrice(line.price)}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              ))}

              {bread ? (
                <div
                  style={{
                    marginTop: "1.2em",
                    fontWeight: 700,
                    fontSize: "0.78em",
                  }}
                >
                  Pane del giorno: {bread}.
                </div>
              ) : null}

              {closing ? (
                <div
                  style={{
                    marginTop: "0.9em",
                    color: "#DCA963",
                    fontSize: "1.5em",
                    fontWeight: 600,
                  }}
                >
                  {closing}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
