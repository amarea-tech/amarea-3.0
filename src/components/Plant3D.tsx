import { motion } from "framer-motion";

type Props = { stage: number };

/**
 * Cute "3D-ish" plant illustrated with layered SVG gradients,
 * soft shadows and gentle micro-animations (sway, breathe, sparkle).
 * Stages: 0 Seme · 1 Germoglio · 2 Foglie · 3 Fiorita
 */
const Plant3D = ({ stage }: Props) => {
  return (
    <div className="relative w-full h-full flex items-end justify-center">
      {/* ground shadow */}
      <motion.div
        className="absolute bottom-2 w-32 h-3 rounded-full bg-foreground/15 blur-md"
        animate={{ scaleX: [1, 0.92, 1], opacity: [0.35, 0.25, 0.35] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.svg
        viewBox="0 0 220 240"
        className="w-full h-full drop-shadow-[0_18px_25px_rgba(20,80,40,0.25)]"
        animate={{ y: [0, -4, 0], rotate: [-1.2, 1.2, -1.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <radialGradient id="potG" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#E89B6B" />
            <stop offset="55%" stopColor="#C97A4A" />
            <stop offset="100%" stopColor="#8A4A28" />
          </radialGradient>
          <linearGradient id="potRim" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#F2B488" />
            <stop offset="100%" stopColor="#B96A3D" />
          </linearGradient>
          <radialGradient id="soilG" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#5C3A22" />
            <stop offset="100%" stopColor="#2E1A0E" />
          </radialGradient>
          <radialGradient id="leafG" cx="30%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#9BD96A" />
            <stop offset="60%" stopColor="#3F9D52" />
            <stop offset="100%" stopColor="#1F5E2E" />
          </radialGradient>
          <radialGradient id="leafG2" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#B7E582" />
            <stop offset="60%" stopColor="#56B863" />
            <stop offset="100%" stopColor="#1F5E2E" />
          </radialGradient>
          <radialGradient id="petalG" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#FFE3EC" />
            <stop offset="55%" stopColor="#FF9CB8" />
            <stop offset="100%" stopColor="#D85A86" />
          </radialGradient>
          <radialGradient id="centerG" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE08A" />
            <stop offset="100%" stopColor="#E8A33A" />
          </radialGradient>
          <radialGradient id="seedG" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#F4D9A8" />
            <stop offset="60%" stopColor="#B98756" />
            <stop offset="100%" stopColor="#5C3A1E" />
          </radialGradient>
        </defs>

        {/* POT */}
        <g>
          <ellipse cx="110" cy="222" rx="62" ry="6" fill="#000" opacity="0.18" />
          <path
            d="M62 165 L158 165 L148 222 Q110 232 72 222 Z"
            fill="url(#potG)"
          />
          {/* pot highlight */}
          <path
            d="M70 172 L80 215 Q82 220 86 220"
            stroke="#FFD3A8"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.55"
            fill="none"
          />
          {/* rim */}
          <ellipse cx="110" cy="165" rx="48" ry="9" fill="url(#potRim)" />
          <ellipse cx="110" cy="164" rx="44" ry="6.5" fill="url(#soilG)" />
          {/* soil sparkle */}
          <circle cx="96" cy="163" r="1.4" fill="#8A5A33" />
          <circle cx="120" cy="165" r="1.2" fill="#8A5A33" />
          <circle cx="130" cy="162" r="1" fill="#8A5A33" />
        </g>

        {/* STAGE 0 — Seed */}
        {stage === 0 && (
          <motion.g
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <ellipse cx="110" cy="156" rx="14" ry="11" fill="url(#seedG)" />
            <path
              d="M100 154 Q110 148 120 154"
              stroke="#F4D9A8"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.7"
            />
            {/* tiny sparkle */}
            <motion.circle
              cx="128"
              cy="140"
              r="2"
              fill="#FFE08A"
              animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          </motion.g>
        )}

        {/* STAGE 1 — Sprout */}
        {stage === 1 && (
          <g>
            <path
              d="M110 162 Q110 130 110 110"
              stroke="#3F9D52"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <motion.g
              style={{ transformOrigin: "110px 130px" }}
              animate={{ rotate: [-4, 4, -4] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ellipse
                cx="96"
                cy="120"
                rx="14"
                ry="8"
                fill="url(#leafG2)"
                transform="rotate(-30 96 120)"
              />
              <ellipse
                cx="124"
                cy="120"
                rx="14"
                ry="8"
                fill="url(#leafG)"
                transform="rotate(30 124 120)"
              />
            </motion.g>
          </g>
        )}

        {/* STAGE 2 — Leaves */}
        {stage === 2 && (
          <g>
            <path
              d="M110 162 Q108 110 110 70"
              stroke="#3F9D52"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <motion.g
              style={{ transformOrigin: "110px 110px" }}
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* lower leaves */}
              <ellipse cx="84" cy="130" rx="22" ry="11" fill="url(#leafG)" transform="rotate(-30 84 130)" />
              <ellipse cx="136" cy="130" rx="22" ry="11" fill="url(#leafG2)" transform="rotate(30 136 130)" />
              {/* mid leaves */}
              <ellipse cx="86" cy="100" rx="20" ry="10" fill="url(#leafG2)" transform="rotate(-25 86 100)" />
              <ellipse cx="134" cy="100" rx="20" ry="10" fill="url(#leafG)" transform="rotate(25 134 100)" />
              {/* top leaf */}
              <ellipse cx="110" cy="74" rx="12" ry="18" fill="url(#leafG2)" />
            </motion.g>
          </g>
        )}

        {/* STAGE 3 — Bloom */}
        {stage === 3 && (
          <g>
            <path
              d="M110 162 Q108 110 110 60"
              stroke="#3F9D52"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <motion.g
              style={{ transformOrigin: "110px 110px" }}
              animate={{ rotate: [-2.5, 2.5, -2.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <ellipse cx="80" cy="135" rx="24" ry="12" fill="url(#leafG)" transform="rotate(-32 80 135)" />
              <ellipse cx="140" cy="135" rx="24" ry="12" fill="url(#leafG2)" transform="rotate(32 140 135)" />
              <ellipse cx="84" cy="100" rx="22" ry="11" fill="url(#leafG2)" transform="rotate(-22 84 100)" />
              <ellipse cx="136" cy="100" rx="22" ry="11" fill="url(#leafG)" transform="rotate(22 136 100)" />
            </motion.g>

            {/* Flower */}
            <motion.g
              style={{ transformOrigin: "110px 60px" }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            >
              {[0, 60, 120, 180, 240, 300].map((a) => (
                <ellipse
                  key={a}
                  cx="110"
                  cy="44"
                  rx="11"
                  ry="16"
                  fill="url(#petalG)"
                  transform={`rotate(${a} 110 60)`}
                />
              ))}
            </motion.g>
            <motion.circle
              cx="110"
              cy="60"
              r="8"
              fill="url(#centerG)"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "110px 60px" }}
            />

            {/* sparkles */}
            {[
              { cx: 60, cy: 50, d: 0 },
              { cx: 170, cy: 70, d: 0.7 },
              { cx: 158, cy: 30, d: 1.4 },
            ].map((s, i) => (
              <motion.g
                key={i}
                animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.6] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: s.d }}
                style={{ transformOrigin: `${s.cx}px ${s.cy}px` }}
              >
                <circle cx={s.cx} cy={s.cy} r="2.2" fill="#FFE08A" />
              </motion.g>
            ))}
          </g>
        )}
      </motion.svg>
    </div>
  );
};

export default Plant3D;