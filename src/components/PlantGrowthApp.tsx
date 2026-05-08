import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudRain,
  Sun,
  Wind,
  Flower2,
  MapPin,
  RefreshCw,
  Sprout,
  Sparkles,
  Droplets,
} from "lucide-react";
import Plant3D from "./Plant3D";

const STAGE_NAMES = ["Seme", "Germoglio", "Foglie", "Fiorita"];
const STAGE_COUNT = 4;

type Weather = {
  rain: number;
  uv: number;
  smog: number;
  pollen: number;
  humidity: number;
};

type StateKey =
  | "loading"
  | "denied"
  | "happy"
  | "uv"
  | "smog"
  | "pollen"
  | "dry"
  | "rainy";

const STATES: Record<
  StateKey,
  { mood: string; title: string; text: string }
> = {
  loading: {
    mood: "✨",
    title: "Sto leggendo l'ambiente…",
    text: "Un istante: la tua piantina si sta orientando.",
  },
  denied: {
    mood: "🧭",
    title: "Posizione non disponibile",
    text: "Mostriamo dati indicativi delle Marche. Concedi la geolocalizzazione per dati locali.",
  },
  happy: {
    mood: "😊✨",
    title: "Oggi è una giornata perfetta",
    text: "Sole gentile, aria pulita: la tua piantina (e la tua pelle) sorridono.",
  },
  uv: {
    mood: "❤️☀️",
    title: "Troppi raggi UV",
    text: "Proteggi la tua piantina e la tua pelle: scegli ombra e SPF.",
  },
  smog: {
    mood: "😵🌫️",
    title: "Aria pesante",
    text: "Lo smog stressa la pelle: stasera coccolala con un gesto detossinante.",
  },
  pollen: {
    mood: "🤧🍃",
    title: "Pollini in volo",
    text: "Detergi delicatamente e scegli texture leniscenti.",
  },
  dry: {
    mood: "🥵💦",
    title: "Ha sete!",
    text: "Poca pioggia: idrata bene la pelle e dai acqua alla tua piantina.",
  },
  rainy: {
    mood: "💧🌦️",
    title: "Pioggia abbondante",
    text: "L'umidità accarezza tutto: lascia respirare la pelle al naturale.",
  },
};

const FALLBACK = { lat: 43.6158, lon: 13.5189, label: "Ancona, IT" };
const STORAGE_KEY = "amarea-plant-progress-v2";

const PlantGrowthApp = () => {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [place, setPlace] = useState<string>("");
  const [status, setStatus] = useState<StateKey>("loading");
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(() => {
    if (typeof window === "undefined") return 15;
    const v = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(v) && v > 0 ? v : 15;
  });
  const [splash, setSplash] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(progress));
  }, [progress]);

  const fetchAll = async (lat: number, lon: number, fallback = false) => {
    setLoading(true);
    try {
      const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum,uv_index_max&current=relative_humidity_2m&timezone=auto&forecast_days=1`;
      const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,grass_pollen,birch_pollen,olive_pollen,alder_pollen,ragweed_pollen&timezone=auto`;
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=it&count=1`;

      const [m, a, g] = await Promise.all([
        fetch(meteoUrl).then((r) => r.json()),
        fetch(airUrl).then((r) => r.json()),
        fetch(geoUrl)
          .then((r) => r.json())
          .catch(() => null),
      ]);

      const c = a?.current ?? {};
      const pollens = [
        c.grass_pollen,
        c.birch_pollen,
        c.olive_pollen,
        c.alder_pollen,
        c.ragweed_pollen,
      ]
        .filter((v) => typeof v === "number")
        .reduce((s: number, v: number) => s + v, 0);

      const w: Weather = {
        rain: m?.daily?.precipitation_sum?.[0] ?? 0,
        uv: m?.daily?.uv_index_max?.[0] ?? 0,
        smog: c.pm10 ?? 0,
        pollen: pollens,
        humidity: m?.current?.relative_humidity_2m ?? 50,
      };
      setWeather(w);
      setCoords({ lat, lon });

      const first = g?.results?.[0];
      if (first) {
        const country = first.country_code ?? "";
        setPlace(`${first.name}${country ? ", " + country : ""}`);
      } else if (fallback) {
        setPlace(FALLBACK.label);
      } else {
        setPlace(`${lat.toFixed(2)}, ${lon.toFixed(2)}`);
      }

      setStatus(deriveStatus(w, fallback));
      setUpdatedAt(
        new Date().toLocaleTimeString("it-IT", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch {
      setStatus("denied");
    } finally {
      setLoading(false);
    }
  };

  const deriveStatus = (w: Weather, fallback: boolean): StateKey => {
    if (w.uv >= 7) return "uv";
    if (w.smog >= 50) return "smog";
    if (w.pollen >= 20) return "pollen";
    if (w.rain >= 8) return "rainy";
    if (w.rain < 0.2 && w.humidity < 40) return "dry";
    if (fallback) return "denied";
    return "happy";
  };

  const requestLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      fetchAll(FALLBACK.lat, FALLBACK.lon, true);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchAll(pos.coords.latitude, pos.coords.longitude),
      () => fetchAll(FALLBACK.lat, FALLBACK.lon, true),
      { timeout: 7000, maximumAge: 1000 * 60 * 10 }
    );
  };

  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = () => {
    if (coords) fetchAll(coords.lat, coords.lon);
    else requestLocation();
  };

  const water = () => {
    setSplash((s) => s + 1);
    setProgress((p) => Math.min(100, p + 12));
  };

  const reset = () => setProgress(15);

  const current = STATES[status];

  const stageIndex = Math.min(
    STAGE_COUNT - 1,
    Math.floor((progress / 100) * STAGE_COUNT)
  );

  const health = useMemo(() => {
    if (!weather) return Math.round(progress);
    let s = 100;
    if (weather.uv >= 7) s -= 18;
    else if (weather.uv >= 5) s -= 6;
    if (weather.smog >= 50) s -= 18;
    else if (weather.smog >= 25) s -= 6;
    if (weather.pollen >= 20) s -= 12;
    else if (weather.pollen >= 5) s -= 4;
    if (weather.rain < 0.2 && weather.humidity < 40) s -= 12;
    if (weather.rain >= 15) s -= 4;
    return Math.max(20, Math.min(100, Math.round(s * 0.7 + progress * 0.3)));
  }, [weather, progress]);

  return (
    <div
      id="grow-with-amarea"
      className="relative overflow-hidden rounded-[2rem] bg-card text-card-foreground border border-border shadow-[0_30px_80px_-30px_hsl(var(--primary)/0.35)] text-left"
    >
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -right-20 w-80 h-80 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-secondary/20 blur-3xl" />

      <div className="relative p-6 md:p-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-2 bg-background/80 backdrop-blur text-primary font-body text-xs font-semibold px-4 py-1.5 rounded-full border border-primary/15">
              <Sparkles size={14} /> Esperienza interattiva
            </span>
            <h3 className="font-display text-3xl md:text-5xl font-extrabold text-foreground mt-3 leading-tight">
              La tua piantina <span className="text-primary italic">Amarea</span>
            </h3>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground font-body text-sm">
              <MapPin size={14} className="text-primary" />
              <span>{place || "Localizzazione in corso…"}</span>
              {updatedAt && (
                <span className="opacity-60">· aggiornato {updatedAt}</span>
              )}
            </div>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start md:self-auto bg-primary text-primary-foreground font-body font-semibold text-sm px-5 py-3 rounded-full hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 transition-all shadow-md"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Aggiorna dati
          </button>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-8 items-stretch">
          {/* Hero plant */}
          <div className="relative rounded-3xl bg-gradient-to-b from-background via-background to-secondary/10 border border-border overflow-hidden">
            {/* Soft sky */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--secondary)/0.15),transparent_60%)]" />

            <div className="relative p-6 md:p-8 flex flex-col items-center min-h-[380px]">
              {/* Mood badge */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={status + "badge"}
                  initial={{ scale: 0.6, opacity: 0, y: -10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="absolute top-5 right-5 bg-background/90 backdrop-blur border border-border rounded-full px-3 py-1.5 text-lg shadow-sm"
                >
                  {current.mood}
                </motion.div>
              </AnimatePresence>

              {/* Plant illustration */}
              <div className="relative flex-1 flex items-center justify-center w-full py-4">
                {/* Water splash */}
                <AnimatePresence>
                  {splash > 0 && (
                    <motion.div
                      key={splash}
                      initial={{ y: -100, opacity: 0, scale: 0.5 }}
                      animate={{ y: 40, opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.6, y: 70 }}
                      transition={{ duration: 0.7, ease: "easeIn" }}
                      className="absolute top-2 z-10"
                    >
                      <WaterDrop className="w-8 h-12 drop-shadow-[0_4px_8px_rgba(56,189,248,0.5)]" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={stageIndex}
                    initial={{ scale: 0.7, opacity: 0, y: 20, rotateY: -25 }}
                    animate={{ scale: 1, opacity: 1, y: 0, rotateY: 0 }}
                    exit={{ scale: 0.85, opacity: 0, rotateY: 25 }}
                    transition={{ type: "spring", stiffness: 130, damping: 14 }}
                    style={{ perspective: 800 }}
                    className="w-52 h-52 md:w-64 md:h-64 flex items-end justify-center"
                  >
                    <Plant3D stage={stageIndex} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Dynamic text */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={status + "txt"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4 }}
                  className="text-center max-w-sm"
                >
                  <p className="font-display text-xl md:text-2xl font-bold text-foreground">
                    {current.title}
                  </p>
                  <p className="font-body text-sm md:text-base text-muted-foreground mt-2 leading-relaxed">
                    {current.text}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Stage chips */}
              <div className="flex items-center gap-1.5 mt-5">
                {STAGE_NAMES.map((n, i) => (
                  <div
                    key={n}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i <= stageIndex
                        ? "w-8 bg-primary"
                        : "w-4 bg-border"
                    }`}
                    title={n}
                  />
                ))}
              </div>
              <p className="font-body text-xs text-muted-foreground mt-2">
                Fase: <span className="text-foreground font-semibold">{STAGE_NAMES[stageIndex]}</span>
              </p>

              {/* Interactive controls */}
              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={water}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-5 py-2.5 rounded-full hover:scale-[1.03] active:scale-[0.98] transition-transform shadow-md"
                >
                  <Droplets size={16} /> Annaffia
                </button>
                <button
                  onClick={reset}
                  className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
                >
                  Ricomincia
                </button>
              </div>
            </div>
          </div>

          {/* Right column: health + metrics */}
          <div className="flex flex-col gap-4">
            {/* Health card */}
            <div className="rounded-3xl bg-background border border-border p-5 md:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-foreground font-body font-semibold">
                  <Sprout size={18} className="text-primary" />
                  Salute della piantina
                </div>
                <span className="font-display text-2xl font-extrabold text-primary">
                  {health}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-secondary via-primary to-primary"
                  animate={{ width: `${health}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <p className="font-body text-xs text-muted-foreground mt-3">
                Calcolata da pioggia, UV, smog e pollini della tua zona.
              </p>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <MetricCard
                icon={<CloudRain size={18} />}
                label="Precipitazioni"
                value={weather ? `${weather.rain.toFixed(1)} mm` : "—"}
                hint={
                  weather
                    ? weather.rain < 0.2
                      ? "Asciutto"
                      : weather.rain < 5
                      ? "Pioggia leggera"
                      : "Abbondante"
                    : ""
                }
              />
              <MetricCard
                icon={<Sun size={18} />}
                label="Indice UV"
                value={weather ? weather.uv.toFixed(1) : "—"}
                hint={
                  weather
                    ? weather.uv < 3
                      ? "Basso"
                      : weather.uv < 6
                      ? "Moderato"
                      : weather.uv < 8
                      ? "Alto"
                      : "Molto alto"
                    : ""
                }
              />
              <MetricCard
                icon={<Wind size={18} />}
                label="Smog (PM10)"
                value={weather ? `${weather.smog.toFixed(0)} µg/m³` : "—"}
                hint={
                  weather
                    ? weather.smog < 25
                      ? "Aria pulita"
                      : weather.smog < 50
                      ? "Discreta"
                      : "Inquinata"
                    : ""
                }
              />
              <MetricCard
                icon={<Flower2 size={18} />}
                label="Pollini"
                value={weather ? weather.pollen.toFixed(1) : "—"}
                hint={
                  weather
                    ? weather.pollen < 5
                      ? "Bassi"
                      : weather.pollen < 20
                      ? "Moderati"
                      : "Alti"
                    : ""
                }
              />
            </div>

            <p className="font-body text-xs text-muted-foreground text-center">
              Dati ambientali in tempo reale · Open-Meteo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) => (
  <motion.div
    whileHover={{ y: -3 }}
    transition={{ type: "spring", stiffness: 200, damping: 15 }}
    className="rounded-2xl bg-background border border-border p-4 md:p-5 shadow-sm"
  >
    <div className="flex items-center gap-2 text-primary text-xs font-body font-semibold uppercase tracking-wide mb-2">
      {icon}
      {label}
    </div>
    <div className="font-display text-2xl md:text-3xl font-extrabold text-foreground leading-none">
      {value}
    </div>
    <div className="font-body text-xs text-muted-foreground mt-1.5">{hint}</div>
  </motion.div>
);

const WaterDrop = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 32 44" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dropGradB" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#bae6fd" />
        <stop offset="55%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
      <radialGradient id="dropShineB" cx="0.35" cy="0.3" r="0.3">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
    </defs>
    <path
      d="M16 2 C16 2 3 18 3 28 a13 13 0 0 0 26 0 C29 18 16 2 16 2 Z"
      fill="url(#dropGradB)"
      stroke="rgba(255,255,255,0.35)"
      strokeWidth="0.8"
    />
    <ellipse cx="11" cy="20" rx="4" ry="6" fill="url(#dropShineB)" />
  </svg>
);

export default PlantGrowthApp;