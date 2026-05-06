import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Sun, CloudRain, Sprout } from "lucide-react";

type Plant = {
  id: string;
  name: string;
  emoji: string;
  stages: string[];
};

const PLANTS: Plant[] = [
  {
    id: "lavanda",
    name: "Lavanda",
    emoji: "💜",
    stages: ["🌱", "🌿", "🪻", "💐"],
  },
  {
    id: "rosmarino",
    name: "Rosmarino",
    emoji: "🌿",
    stages: ["🌱", "🌿", "🌳", "🌲"],
  },
  {
    id: "elicriso",
    name: "Elicriso",
    emoji: "🌼",
    stages: ["🌱", "🌿", "🌾", "🌻"],
  },
  {
    id: "camomilla",
    name: "Camomilla",
    emoji: "🌼",
    stages: ["🌱", "🌿", "🌾", "🌼"],
  },
];

const STORAGE_KEY = "amarea-plant-state-v1";
const MAX_WATER = 100;
const GROWTH_PER_WATER = 8;
const WATER_DROP_PER_HOUR = 4;

type State = {
  plantId: string;
  water: number;
  growth: number;
  lastTick: number;
};

const defaultState: State = {
  plantId: PLANTS[0].id,
  water: 60,
  growth: 0,
  lastTick: Date.now(),
};

const PlantGrowthApp = () => {
  const [state, setState] = useState<State>(defaultState);
  const [weather, setWeather] = useState<{ rain: number; uv: number } | null>(null);
  const [splash, setSplash] = useState(0);

  // Hydrate from storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: State = JSON.parse(raw);
        const hours = (Date.now() - parsed.lastTick) / (1000 * 60 * 60);
        const newWater = Math.max(0, parsed.water - hours * WATER_DROP_PER_HOUR);
        setState({ ...parsed, water: newWater, lastTick: Date.now() });
      }
    } catch {}
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Fetch weather (Ancona, Marche)
  useEffect(() => {
    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=43.6158&longitude=13.5189&daily=precipitation_sum,uv_index_max&timezone=Europe%2FRome&forecast_days=1";
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setWeather({
          rain: d?.daily?.precipitation_sum?.[0] ?? 0,
          uv: d?.daily?.uv_index_max?.[0] ?? 0,
        });
      })
      .catch(() => setWeather({ rain: 0.4, uv: 5.2 }));
  }, []);

  const plant = useMemo(
    () => PLANTS.find((p) => p.id === state.plantId) ?? PLANTS[0],
    [state.plantId]
  );

  const stageIndex = Math.min(
    plant.stages.length - 1,
    Math.floor((state.growth / 100) * plant.stages.length)
  );

  const water = () => {
    if (state.water >= MAX_WATER) return;
    setSplash((s) => s + 1);
    setState((s) => ({
      ...s,
      water: Math.min(MAX_WATER, s.water + 20),
      growth: Math.min(100, s.growth + GROWTH_PER_WATER),
      lastTick: Date.now(),
    }));
  };

  const reset = () => {
    setState({ ...defaultState, plantId: state.plantId, lastTick: Date.now() });
  };

  const choose = (id: string) => {
    setState({ ...defaultState, plantId: id, lastTick: Date.now() });
  };

  const mood =
    state.water > 70 ? "Felice" : state.water > 35 ? "Assetata" : "Ha sete!";

  return (
    <div className="bg-primary-foreground/5 backdrop-blur-md border border-primary-foreground/15 rounded-3xl p-6 md:p-10 text-left">
      <div className="flex items-center gap-2 mb-6">
        <Sprout className="text-primary-foreground" size={20} />
        <h3 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
          La tua piantina Amarea
        </h3>
      </div>

      {/* Plant picker */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PLANTS.map((p) => (
          <button
            key={p.id}
            onClick={() => choose(p.id)}
            className={`px-4 py-2 rounded-full text-sm font-body transition-all ${
              p.id === state.plantId
                ? "bg-primary-foreground text-primary font-semibold"
                : "bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
            }`}
          >
            <span className="mr-1">{p.emoji}</span>
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Plant display */}
        <div className="relative aspect-square md:aspect-auto md:min-h-[320px] rounded-2xl bg-gradient-to-b from-primary-foreground/10 to-primary-foreground/5 border border-primary-foreground/10 flex flex-col items-center justify-end overflow-hidden p-6">
          <AnimatePresence>
            {splash > 0 && (
              <motion.div
                key={splash}
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 40, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute top-4 text-3xl"
              >
                💧
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            key={stageIndex}
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="text-[8rem] md:text-[10rem] leading-none drop-shadow-lg"
          >
            {plant.stages[stageIndex]}
          </motion.div>
          <div className="w-full mt-4">
            <div className="flex items-center justify-between text-xs font-body text-primary-foreground/80 mb-1">
              <span>Crescita</span>
              <span>{Math.round(state.growth)}%</span>
            </div>
            <div className="h-2 rounded-full bg-primary-foreground/15 overflow-hidden">
              <motion.div
                className="h-full bg-secondary"
                animate={{ width: `${state.growth}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Stats panel */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-primary-foreground/10 border border-primary-foreground/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-primary-foreground">
                <Droplets size={18} />
                <span className="font-body font-semibold">Idratazione</span>
              </div>
              <span className="font-body text-sm text-primary-foreground/80">
                {Math.round(state.water)}% · {mood}
              </span>
            </div>
            <div className="h-3 rounded-full bg-primary-foreground/15 overflow-hidden mb-4">
              <motion.div
                className="h-full bg-gradient-to-r from-sky-300 to-sky-500"
                animate={{ width: `${state.water}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <button
              onClick={water}
              disabled={state.water >= MAX_WATER}
              className="w-full bg-primary-foreground text-primary font-body font-semibold py-3 rounded-full hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 transition-transform"
            >
              💧 Annaffia
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-primary-foreground/10 border border-primary-foreground/10 p-4">
              <div className="flex items-center gap-2 text-primary-foreground/80 text-xs font-body mb-1">
                <CloudRain size={14} /> Precipitazioni
              </div>
              <div className="font-display text-2xl font-bold text-primary-foreground">
                {weather ? `${weather.rain.toFixed(1)} mm` : "—"}
              </div>
              <div className="text-[11px] text-primary-foreground/60">oggi · Marche</div>
            </div>
            <div className="rounded-2xl bg-primary-foreground/10 border border-primary-foreground/10 p-4">
              <div className="flex items-center gap-2 text-primary-foreground/80 text-xs font-body mb-1">
                <Sun size={14} /> Indice UV
              </div>
              <div className="font-display text-2xl font-bold text-primary-foreground">
                {weather ? weather.uv.toFixed(1) : "—"}
              </div>
              <div className="text-[11px] text-primary-foreground/60">max giornaliero</div>
            </div>
          </div>

          <button
            onClick={reset}
            className="text-xs font-body text-primary-foreground/60 hover:text-primary-foreground transition-colors self-end"
          >
            Ricomincia da capo
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantGrowthApp;