import { motion } from "framer-motion";
import fogliolinaImg from "@/assets/grow/fogliolina.webp";
import sunnyImg from "@/assets/grow/mascot-sunny.webp";
import rainyImg from "@/assets/grow/mascot-rainy.webp";
import windyImg from "@/assets/grow/mascot-windy.webp";
import snowyImg from "@/assets/grow/mascot-snowy.webp";

type Mood = "serene" | "uv" | "smog" | "pollen" | "dry" | "rainy";
type Weather = "sunny" | "rainy" | "windy" | "snowy" | "default";

const WEATHER_IMG: Record<Weather, string> = {
  sunny: sunnyImg,
  rainy: rainyImg,
  windy: windyImg,
  snowy: snowyImg,
  default: fogliolinaImg,
};

const GLOW: Record<Mood, string> = {
  serene: "0 0 80px 8px rgba(168, 184, 154, 0.35)",
  uv: "0 0 90px 10px rgba(232, 196, 130, 0.45)",
  smog: "0 0 70px 8px rgba(180, 180, 180, 0.30)",
  pollen: "0 0 80px 8px rgba(201, 184, 217, 0.45)",
  dry: "0 0 70px 6px rgba(212, 184, 150, 0.35)",
  rainy: "0 0 90px 10px rgba(170, 200, 220, 0.45)",
};

const TINT: Record<Mood, string> = {
  serene: "saturate(1) brightness(1)",
  uv: "saturate(0.95) brightness(1.05) hue-rotate(-6deg)",
  smog: "saturate(0.7) brightness(0.95)",
  pollen: "saturate(1) brightness(1.02) hue-rotate(8deg)",
  dry: "saturate(0.85) brightness(0.97)",
  rainy: "saturate(1.05) brightness(1.02)",
};

/* mood-driven micro-reactions: breathing rhythm + tilt amplitude */
const REACTION: Record<Mood, { breath: number; tiltA: number; floatA: number; cycle: number }> = {
  serene: { breath: 0.022, tiltA: 1.0, floatA: 8, cycle: 7.5 },
  uv:     { breath: 0.030, tiltA: 1.6, floatA: 10, cycle: 6.2 },
  smog:   { breath: 0.014, tiltA: 0.6, floatA: 5,  cycle: 9.0 },
  pollen: { breath: 0.026, tiltA: 1.4, floatA: 9,  cycle: 6.8 },
  dry:    { breath: 0.018, tiltA: 0.8, floatA: 6,  cycle: 8.2 },
  rainy:  { breath: 0.020, tiltA: 1.0, floatA: 7,  cycle: 7.0 },
};

interface Props {
  mood?: Mood;
  size?: number;
  weather?: Weather;
}

const Fogliolina = ({ mood = "serene", size = 360, weather = "default" }: Props) => {
  const src = WEATHER_IMG[weather] ?? fogliolinaImg;
  const r = REACTION[mood];
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* soft halo */}
      <motion.div
        aria-hidden
        className="absolute inset-6 rounded-full"
        style={{ boxShadow: GLOW[mood] }}
        animate={{ opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* dew / pollen ambient particles */}
      {(mood === "rainy" || mood === "pollen") && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${15 + i * 12}%`,
                top: "0%",
                width: mood === "rainy" ? 4 : 6,
                height: mood === "rainy" ? 4 : 6,
                background:
                  mood === "rainy"
                    ? "rgba(170,200,220,0.7)"
                    : "rgba(201,184,217,0.7)",
              }}
              animate={{ y: [0, size - 40], opacity: [0, 0.9, 0] }}
              transition={{
                duration: 4 + i * 0.4,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeIn",
              }}
            />
          ))}
        </div>
      )}

      {/* breathing + floating mascot */}
      <motion.div
        className="relative"
        animate={{
          y: [0, -r.floatA, 0],
          rotate: [-r.tiltA, r.tiltA, -r.tiltA],
        }}
        transition={{
          duration: r.cycle,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ width: size * 0.85, height: size * 0.85 }}
      >
        <motion.img
          src={src}
          alt="Fogliolina, la mascotte Amarea"
          width={1024}
          height={1024}
          className="w-full h-full object-cover select-none rounded-[28px]"
          draggable={false}
          style={{
            filter: TINT[mood],
            boxShadow:
              "0 18px 40px -18px rgba(60,50,40,0.35), 0 2px 6px rgba(60,50,40,0.08)",
          }}
          animate={{ scale: [1, 1 + r.breath, 1] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
        />

        {/* "blink" — subtle luminance dip simulating a slow, elegant blink */}
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-[28px] pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, transparent 38%, rgba(40,30,25,0.10) 47%, rgba(40,30,25,0.14) 50%, rgba(40,30,25,0.10) 53%, transparent 62%)",
            mixBlendMode: "multiply",
          }}
          animate={{ opacity: [0, 0, 0, 0.85, 0, 0, 0, 0, 0.7, 0] }}
          transition={{
            duration: 9,
            repeat: Infinity,
            times: [0, 0.18, 0.22, 0.235, 0.25, 0.45, 0.6, 0.74, 0.755, 0.77],
            ease: "easeInOut",
          }}
        />

        {/* vitality sheen — slow light pass */}
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-[28px] pointer-events-none overflow-hidden"
        >
          <motion.div
            className="absolute -inset-y-4 w-[40%]"
            style={{
              background:
                "linear-gradient(110deg, transparent 0%, rgba(255,245,225,0.18) 50%, transparent 100%)",
              filter: "blur(8px)",
            }}
            animate={{ x: ["-60%", "260%"] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", repeatDelay: 4 }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Fogliolina;
export type { Mood };