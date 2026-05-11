import { motion } from "framer-motion";
import fogliolinaImg from "@/assets/grow/fogliolina.png";
import sunnyImg from "@/assets/grow/mascot-sunny.png";
import rainyImg from "@/assets/grow/mascot-rainy.png";
import windyImg from "@/assets/grow/mascot-windy.png";
import snowyImg from "@/assets/grow/mascot-snowy.png";

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

interface Props {
  mood?: Mood;
  size?: number;
  weather?: Weather;
}

const Fogliolina = ({ mood = "serene", size = 360, weather = "default" }: Props) => {
  const src = WEATHER_IMG[weather] ?? fogliolinaImg;
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
          y: [0, -10, 0],
          rotate: [-1.2, 1.2, -1.2],
        }}
        transition={{
          duration: 7,
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
          className="w-full h-full object-contain select-none"
          draggable={false}
          style={{ filter: TINT[mood] }}
          animate={{ scale: [1, 1.025, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
};

export default Fogliolina;
export type { Mood };