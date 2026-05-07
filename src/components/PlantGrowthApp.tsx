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
} from "lucide-react";

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
  { emoji: string; title: string; text: string; tone: string }
> = {
  loading: {
    emoji: "🌱✨",
    title: "Sto leggendo l'ambiente…",
    text: "Un istante: la tua piantina si sta orientando.",
    tone: "from-emerald-100 to-lime-50",
  },
  denied: {
    emoji: "🌱🧭",
    title: "Posizione non disponibile",
    text: "Mostriamo dati indicativi delle Marche. Concedi la geolocalizzazione per dati locali.",
    tone: "from-amber-50 to-emerald-50",
  },
  happy: {
    emoji: "🌱✨😊",
    title: "Oggi è una giornata perfetta",
    text: "Sole gentile, aria pulita: la tua piantina (e la tua pelle) sorridono.",
    tone: "from-emerald-100 to-lime-50",
  },
  uv: {
    emoji: "🌱❤️☀️",
    title: "Troppi raggi UV",
    text: "Proteggi la tua piantina e la tua pelle: scegli ombra e SPF.",
    tone: "from-amber-100 to-rose-50",
  },
  smog: {
    emoji: "🌱😵🌫️",
    title: "Aria pesante",
    text: "Lo smog stressa la pelle: stasera coccolala con un gesto detossinante.",
    tone: "from-stone-100 to-zinc-50",
  },
  pollen: {
    emoji: "🌱🤧🍃",
    title: "Pollini in volo",
    text: "Detergi delicatamente e scegli texture leniscenti.",
    tone: "from-yellow-50 to-emerald-50",
  },
  dry: {
    emoji: "🌱🥵💦",
    title: "Ha sete!",
    text: "Poca pioggia: idrata bene la pelle e dai acqua alla tua piantina.",
    tone: "from-orange-50 to-amber-50",
  },
  rainy: {
    emoji: "🌱💧🌦️",
    title: "Pioggia abbondante",
    text: "L'umidità accarezza tutto: lascia respirare la pelle al naturale.",
    tone: "from-sky-100 to-emerald-50",
  },
};

const FALLBACK = { lat: 43.6158, lon: 13.5189, label: "Ancona, IT" };

const PlantGrowthApp = () => {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [place, setPlace] = useState<string>("");
  const [status, setStatus] = useState<StateKey>("loading");
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [loading, setLoading] = useState(false);

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

  const current = STATES[status];

  const health = useMemo(() => {
    if (!weather) return 50;
    let s = 100;
    if (weather.uv >= 7) s -= 20;
    else if (weather.uv >= 5) s -= 8;
    if (weather.smog >= 50) s -= 20;
    else if (weather.smog >= 25) s -= 8;
    if (weather.pollen >= 20) s -= 15;
    else if (weather.pollen >= 5) s -= 5;
    if (weather.rain < 0.2 && weather.humidity < 40) s -= 15;
    if (weather.rain >= 15) s -= 5;
    return Math.max(15, Math.min(100, s));
  }, [weather]);

  return (
    <div
      id="grow-with-amarea"
      className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${current.tone} border border-emerald-900/10 shadow-[0_30px_80px_-30px_rgba(20,83,45,0.25)] text-left transition-colors duration-700`}
    >
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-20 -right-16 w-72 h-72 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-lime-200/40 blur-3xl" />

      <div className="relative p-6 md:p-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-2 bg-white/70 backdrop-blur text-emerald-800 font-body text-xs font-semibold px-4 py-1.5 rounded-full border border-emerald-900/10">
              <Sparkles size={14} /> Esperienza interattiva
            </span>
            <h3 className="font-display text-3xl md:text-5xl font-extrabold text-emerald-950 mt-3 leading-tight">
              La tua piantina <span className="text-emerald-700">Amarea</span>
            </h3>
            <div className="flex items-center gap-2 mt-2 text-emerald-900/70 font-body text-sm">
              <MapPin size={14} />
              <span>{place || "Localizzazione in corso…"}</span>
              {updatedAt && (
                <span className="text-emerald-900/50">· {updatedAt}</span>
              )}
            </div>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start md:self-auto bg-emerald-900 text-emerald-50 font-body font-semibold text-sm px-5 py-3 rounded-full hover:bg-emerald-800 active:scale-[0.98] disabled:opacity-60 transition-all"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Aggiorna dati
          </button>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 items-stretch">
          {/* Hero plant */}
          <div className="relative rounded-3xl bg-white/60 backdrop-blur border border-white/80 p-6 md:p-8 flex flex-col items-center justify-center min-h-[320px] overflow-hidden">
            {/* sun + clouds deco */}
            <div className="absolute top-4 right-5 text-2xl opacity-70 select-none">☁️</div>
            <div className="absolute top-6 left-6 text-xl opacity-60 select-none">✨</div>
            <div className="absolute bottom-3 left-4 text-xl opacity-60 select-none">🌿</div>
            <div className="absolute bottom-3 right-4 text-xl opacity-60 select-none">🌿</div>

            <AnimatePresence mode="wait">
              <motion.div
                key={status}
                initial={{ scale: 0.7, opacity: 0, y: 20 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  y: [0, -8, 0],
                  rotate: [-2, 2, -2],
                }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{
                  scale: { type: "spring", stiffness: 130, damping: 12 },
                  opacity: { duration: 0.4 },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                }}
                className="text-7xl md:text-8xl leading-none drop-shadow-md select-none"
              >
                {current.emoji}
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={status + "txt"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4 }}
                className="mt-6 text-center max-w-sm"
              >
                <p className="font-display text-xl md:text-2xl font-bold text-emerald-950">
                  {current.title}
                </p>
                <p className="font-body text-sm md:text-base text-emerald-900/70 mt-2 leading-relaxed">
                  {current.text}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Health bar */}
            <div className="w-full mt-6 max-w-sm">
              <div className="flex items-center justify-between text-xs font-body text-emerald-900/70 mb-1.5">
                <span className="inline-flex items-center gap-1">
                  <Sprout size={12} /> Salute della piantina
                </span>
                <span className="font-semibold">{health}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-emerald-900/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-lime-400 via-emerald-400 to-emerald-600"
                  animate={{ width: `${health}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 gap-4 content-center">
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
              accent="text-sky-700"
              bg="bg-sky-50/80"
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
              accent="text-amber-700"
              bg="bg-amber-50/80"
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
              accent="text-stone-700"
              bg="bg-stone-100/80"
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
              accent="text-rose-700"
              bg="bg-rose-50/80"
            />
          </div>
        </div>

        <p className="mt-6 text-center font-body text-xs text-emerald-900/60">
          Dati ambientali in tempo reale · Open-Meteo
        </p>
      </div>
    </div>
  );
};

const MetricCard = ({
  icon,
  label,
  value,
  hint,
  accent,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  accent: string;
  bg: string;
}) => (
  <motion.div
    whileHover={{ y: -3 }}
    transition={{ type: "spring", stiffness: 200, damping: 15 }}
    className={`rounded-2xl ${bg} backdrop-blur border border-white/80 p-4 md:p-5 shadow-sm`}
  >
    <div
      className={`flex items-center gap-2 ${accent} text-xs font-body font-semibold uppercase tracking-wide mb-2`}
    >
      {icon}
      {label}
    </div>
    <div className="font-display text-2xl md:text-3xl font-extrabold text-emerald-950 leading-none">
      {value}
    </div>
    <div className="font-body text-xs text-emerald-900/60 mt-1.5">{hint}</div>
  </motion.div>
);

export default PlantGrowthApp;