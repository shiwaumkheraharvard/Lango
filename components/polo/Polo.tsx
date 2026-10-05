"use client";

import { motion, type TargetAndTransition } from "framer-motion";

export type PoloPose = "idle" | "wave" | "listen" | "talk" | "write" | "grade" | "celebrate" | "sad" | "sleep";

interface Props {
  pose?: PoloPose;
  /** When true (with pose "talk"), the mouth moves. */
  talking?: boolean;
  size?: number | string;
  className?: string;
  label?: string;
}

const FUR = "#F8F6F3";
const FUR_LINE = "#E2DBD3";
const FUR_SHADE = "#EFEAE4";
const INK = "#1A1A1A";
const ORANGE = "#FF6B1A";
const ORANGE_DEEP = "#E85D04";
const BLUSH = "#F6D3C4";

const spring = { type: "spring", stiffness: 120, damping: 14 } as const;

/**
 * Polo — a round, slightly confused polar bear in an orange scarf. Inline SVG, animated with
 * Framer Motion. Every articulated part is a sibling group in root coordinates so transform
 * origins resolve against each part's own bounding box.
 */
export function Polo({ pose = "idle", talking = false, size = 200, className = "", label }: Props) {
  const isTalking = pose === "talk" && talking;

  // ---- whole-body motion ----
  const body: TargetAndTransition =
    pose === "celebrate"
      ? { y: [0, -14, 0], transition: { duration: 0.6, repeat: Infinity, ease: "easeOut" } }
      : pose === "sad"
        ? { x: [-1.5, 1.5, -1.5], transition: { duration: 0.14, repeat: Infinity } }
        : pose === "sleep"
          ? { y: [0, 2, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } }
          : { y: [0, -2, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } };

  // ---- head motion ----
  const head: TargetAndTransition =
    pose === "listen"
      ? { rotate: [-3, 3, -3], transition: { duration: 1.1, repeat: Infinity, ease: "easeInOut" } }
      : pose === "sleep"
        ? { rotate: 9, y: 4 }
        : pose === "write"
          ? { rotate: -6, y: 3 }
          : pose === "grade"
            ? { rotate: 4 }
            : pose === "sad"
              ? { rotate: -4, y: 3 }
              : pose === "celebrate"
                ? { rotate: [-4, 4, -4], transition: { duration: 0.6, repeat: Infinity } }
                : { rotate: 0, y: 0 };

  // ---- arms (hang at ±18°; negative = right arm swings up/out) ----
  const leftArm: TargetAndTransition =
    pose === "celebrate"
      ? { rotate: [150, 165, 150], transition: { duration: 0.6, repeat: Infinity } }
      : pose === "sad"
        ? { rotate: 30 }
        : pose === "listen"
          ? { rotate: 24 }
          : { rotate: [18, 21, 18], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } };

  const rightArm: TargetAndTransition =
    pose === "wave"
      ? { rotate: [-150, -178, -150], transition: { duration: 0.7, repeat: Infinity, ease: "easeInOut" } }
      : pose === "celebrate"
        ? { rotate: [-150, -165, -150], transition: { duration: 0.6, repeat: Infinity } }
        : pose === "write"
          ? { rotate: -62 }
          : pose === "grade"
            ? { rotate: -118 }
            : pose === "sad"
              ? { rotate: -30 }
              : pose === "listen"
                ? { rotate: -24 }
                : { rotate: [-18, -21, -18], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } };

  const eyes = pose === "sleep" ? "closed" : pose === "write" ? "squint" : pose === "celebrate" ? "happy" : "open";
  const sad = pose === "sad";

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={label ?? `Polo the polar bear, ${pose}`}
      style={{ overflow: "visible" }}
    >
      <motion.g animate={body}>
        {/* ---- left arm (behind body) ---- */}
        <motion.g animate={leftArm} transition={spring} style={{ originX: 0.5, originY: 0.12 }}>
          <ellipse cx="54" cy="136" rx="13" ry="24" fill={FUR} stroke={FUR_LINE} strokeWidth="1.5" />
          <ellipse cx="54" cy="156" rx="8" ry="5" fill={FUR_SHADE} />
        </motion.g>

        {/* ---- body ---- */}
        <ellipse cx="100" cy="138" rx="56" ry="48" fill={FUR} stroke={FUR_LINE} strokeWidth="1.5" />
        <ellipse cx="100" cy="146" rx="36" ry="30" fill={FUR_SHADE} opacity="0.7" />

        {/* ---- feet ---- */}
        <ellipse cx="78" cy="184" rx="18" ry="8" fill={FUR} stroke={FUR_LINE} strokeWidth="1.5" />
        <ellipse cx="122" cy="184" rx="18" ry="8" fill={FUR} stroke={FUR_LINE} strokeWidth="1.5" />
        <circle cx="72" cy="184" r="2" fill={FUR_LINE} /><circle cx="79" cy="182" r="2" fill={FUR_LINE} /><circle cx="86" cy="184" r="2" fill={FUR_LINE} />
        <circle cx="116" cy="184" r="2" fill={FUR_LINE} /><circle cx="123" cy="182" r="2" fill={FUR_LINE} /><circle cx="130" cy="184" r="2" fill={FUR_LINE} />

        {/* ---- scarf ---- */}
        <path d="M 60 106 Q 100 126 140 106 L 142 118 Q 100 140 58 118 Z" fill={ORANGE} />
        <motion.path
          d="M 72 118 L 60 154 L 78 152 L 86 122 Z"
          fill={ORANGE_DEEP}
          animate={sad ? { rotate: [-6, 6, -6], transition: { duration: 0.3, repeat: Infinity } } : { rotate: [0, 3, 0], transition: { duration: 3, repeat: Infinity } }}
          style={{ originX: 0.6, originY: 0 }}
        />
        <path d="M 64 112 Q 100 130 136 112" stroke={ORANGE_DEEP} strokeWidth="2" fill="none" opacity="0.6" />

        {/* ---- head ---- */}
        <motion.g animate={head} transition={spring} style={{ originX: 0.5, originY: 0.95 }}>
          {/* ears */}
          <circle cx="64" cy="44" r="10" fill={FUR} stroke={FUR_LINE} strokeWidth="1.5" />
          <circle cx="136" cy="44" r="10" fill={FUR} stroke={FUR_LINE} strokeWidth="1.5" />
          <circle cx="64" cy="44" r="4.5" fill={BLUSH} />
          <circle cx="136" cy="44" r="4.5" fill={BLUSH} />
          {/* face */}
          <circle cx="100" cy="76" r="44" fill={FUR} stroke={FUR_LINE} strokeWidth="1.5" />
          {/* blush */}
          <ellipse cx="70" cy="88" rx="7" ry="4" fill={BLUSH} opacity="0.8" />
          <ellipse cx="130" cy="88" rx="7" ry="4" fill={BLUSH} opacity="0.8" />
          {/* muzzle */}
          <ellipse cx="100" cy="92" rx="17" ry="12" fill="#FFFFFF" stroke={FUR_LINE} strokeWidth="1.5" />
          <ellipse cx="100" cy="87" rx="6.5" ry="4.8" fill={INK} />
          <circle cx="98" cy="85.5" r="1.6" fill="#fff" opacity="0.8" />

          {/* eyes */}
          {eyes === "open" && (
            <>
              <circle cx="84" cy="74" r="4.2" fill={INK} />
              <circle cx="85.5" cy="72.5" r="1.3" fill="#fff" />
              {pose === "grade" ? (
                <>
                  <circle cx="117" cy="75" r="6.5" fill={INK} />
                  <circle cx="119.5" cy="72.5" r="2" fill="#fff" />
                </>
              ) : (
                <>
                  <circle cx="116" cy="74" r="4.2" fill={INK} />
                  <circle cx="117.5" cy="72.5" r="1.3" fill="#fff" />
                </>
              )}
            </>
          )}
          {eyes === "squint" && (
            <>
              <path d="M 78 75 L 90 75" stroke={INK} strokeWidth="3" strokeLinecap="round" />
              <path d="M 110 75 L 122 75" stroke={INK} strokeWidth="3" strokeLinecap="round" />
            </>
          )}
          {eyes === "closed" && (
            <>
              <path d="M 78 74 Q 84 79 90 74" stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none" />
              <path d="M 110 74 Q 116 79 122 74" stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none" />
            </>
          )}
          {eyes === "happy" && (
            <>
              <path d="M 78 76 Q 84 69 90 76" stroke={INK} strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M 110 76 Q 116 69 122 76" stroke={INK} strokeWidth="2.8" strokeLinecap="round" fill="none" />
            </>
          )}

          {/* eyebrows — the signature slightly-confused asymmetry */}
          {sad ? (
            <>
              <path d="M 75 66 L 91 60" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
              <path d="M 109 60 L 125 66" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
            </>
          ) : eyes === "squint" ? (
            <>
              <path d="M 76 67 L 92 69" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
              <path d="M 108 69 L 124 67" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
            </>
          ) : pose === "sleep" ? (
            <>
              <path d="M 76 65 Q 84 63 92 65" stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none" />
              <path d="M 108 65 Q 116 63 124 65" stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <path d="M 75 65 Q 84 62 92 65" stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none" />
              <motion.path
                d="M 108 58 Q 117 54 126 58"
                stroke={INK}
                strokeWidth="2.6"
                strokeLinecap="round"
                fill="none"
                animate={pose === "idle" || pose === "talk" ? { y: [0, -1.5, 0], transition: { duration: 2.2, repeat: Infinity, repeatDelay: 1.6 } } : { y: 0 }}
              />
            </>
          )}

          {/* mouth */}
          {isTalking ? (
            <motion.ellipse
              cx="100"
              cy="99"
              rx="5"
              fill={INK}
              animate={{ ry: [1.5, 4.5, 2, 4, 1.5] }}
              transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : sad ? (
            <path d="M 94 102 Q 100 97 106 102" stroke={INK} strokeWidth="2.2" strokeLinecap="round" fill="none" />
          ) : pose === "celebrate" ? (
            <path d="M 92 98 Q 100 108 108 98 Z" fill={INK} />
          ) : pose === "sleep" ? (
            <ellipse cx="102" cy="100" rx="2.5" ry="1.8" fill={INK} />
          ) : (
            <path d="M 94 98 Q 100 103 106 98" stroke={INK} strokeWidth="2.2" strokeLinecap="round" fill="none" />
          )}

          {/* headphones */}
          {pose === "listen" && (
            <>
              <path d="M 58 72 Q 100 14 142 72" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
              <rect x="50" y="62" width="14" height="24" rx="6" fill={INK} />
              <rect x="136" y="62" width="14" height="24" rx="6" fill={INK} />
              <rect x="54" y="68" width="6" height="12" rx="3" fill={ORANGE} />
              <rect x="140" y="68" width="6" height="12" rx="3" fill={ORANGE} />
            </>
          )}

          {/* tear */}
          {sad && (
            <motion.path
              d="M 120 84 q 4 7 0 10 q -4 -3 0 -10 Z"
              fill="#8EC5FF"
              animate={{ y: [0, 10], opacity: [0.9, 0] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeIn" }}
            />
          )}
        </motion.g>

        {/* ---- magnifying glass (held up to the face) ---- */}
        {pose === "grade" && (
          <g>
            <circle cx="117" cy="75" r="17" fill="rgba(255,255,255,0.18)" stroke={INK} strokeWidth="3.5" />
            <path d="M 106 66 Q 112 60 120 61" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
            <path d="M 129 87 L 142 104" stroke={INK} strokeWidth="6" strokeLinecap="round" />
          </g>
        )}

        {/* ---- right arm (front) + hand-held props ---- */}
        <motion.g animate={rightArm} transition={spring} style={{ originX: 0.5, originY: 0.12 }}>
          <ellipse cx="146" cy="136" rx="13" ry="24" fill={FUR} stroke={FUR_LINE} strokeWidth="1.5" />
          <ellipse cx="146" cy="156" rx="8" ry="5" fill={FUR_SHADE} />
          {pose === "write" && (
            <g transform="rotate(35 146 156)">
              <rect x="143" y="128" width="6" height="40" rx="1.5" fill={ORANGE} />
              <path d="M 143 168 L 146 176 L 149 168 Z" fill="#F3D9CB" />
              <path d="M 144.5 172 L 146 176 L 147.5 172 Z" fill={INK} />
              <rect x="143" y="128" width="6" height="5" rx="1" fill={BLUSH} />
            </g>
          )}
          {pose === "celebrate" && (
            <g>
              <path d="M 146 158 L 146 100" stroke={INK} strokeWidth="3" strokeLinecap="round" />
              <motion.path d="M 146 100 L 178 108 L 146 118 Z" fill={ORANGE} animate={{ scaleX: [1, 0.85, 1] }} transition={{ duration: 0.5, repeat: Infinity }} style={{ originX: 0, originY: 0.5 }} />
            </g>
          )}
        </motion.g>

        {/* ---- confetti ---- */}
        {pose === "celebrate" &&
          [
            [30, 40, ORANGE],
            [170, 30, ORANGE_DEEP],
            [20, 90, "#FFC79A"],
            [185, 80, ORANGE],
            [60, 20, "#FFC79A"],
            [150, 10, ORANGE_DEEP],
          ].map(([x, y, c], i) => (
            <motion.rect
              key={i}
              x={x as number}
              y={y as number}
              width="6"
              height="6"
              rx="1.5"
              fill={c as string}
              animate={{ y: [0, 40], opacity: [1, 0], rotate: [0, 180] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18, ease: "easeIn" }}
            />
          ))}

        {/* ---- snow for the sad pose ---- */}
        {sad &&
          [24, 60, 150, 182].map((x, i) => (
            <motion.circle
              key={i}
              cx={x}
              cy={10}
              r="2.5"
              fill="#BFE0FF"
              animate={{ y: [0, 60], opacity: [0, 1, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.5, ease: "linear" }}
            />
          ))}

        {/* ---- zzz ---- */}
        {pose === "sleep" &&
          [0, 1, 2].map((i) => (
            <motion.text
              key={i}
              x={140 + i * 14}
              y={48 - i * 14}
              fontSize={14 + i * 5}
              fontWeight={800}
              fill={ORANGE_DEEP}
              fontFamily="var(--font-display), system-ui, sans-serif"
              animate={{ y: [48 - i * 14, 30 - i * 14], opacity: [0, 1, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
            >
              z
            </motion.text>
          ))}
      </motion.g>
    </svg>
  );
}
