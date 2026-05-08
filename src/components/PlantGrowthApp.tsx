import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Wind,
  Droplets,
  Flower2,
  MapPin,
  RefreshCw,
  Sparkles,
  Thermometer,
  Moon,
  Sunrise,
  Sunset,
  Eye,
  Activity,
  ShieldCheck,
  Waves,
  CloudFog,
} from "lucide-react";
import assistantImg from "@/assets/fogliolina/happy.png";

/* =========================================================
   ENVIRONMENTAL SKIN INSIGHTS · Amarea Cosmetics
   Premium scientific skin-weather dashboard
   ========================================================= */

type Weather = {
  uv: number;
  pm10: number;
  pm25: number;
  aqi: number;
  pollen: number;
  humidity: number;
  temperature: number;
  wind: number;
  cloud: number;
  sunrise: string; // ISO
  sunset: string; // ISO
  isDay: boolean;
};

type Circadian = "day" | "sunset" | "night";

const FALLBACK = { lat: 43.6158, lon: 13.5189, label: "Ancona, IT" };

const PlantGrowthApp = () => {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [place, setPlace] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [denied, setDenied] = useState(false);

  const fetchAll = async (lat: number, lon: number, fallback = false) => {
    setLoading(true);
    try {
      const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset,uv_index_max&current=relative_humidity_2m,temperature_2m,wind_speed_10m,cloud_cover,is_day,uv_index&timezone=auto&forecast_days=1`;
      const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,us_aqi,grass_pollen,birch_pollen,olive_pollen,alder_pollen,ragweed_pollen&timezone=auto`;
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=it&count=1`;

      const [m, a, g] = await Promise.all([
        fetch(meteoUrl).then((r) => r.json()),
        fetch(airUrl).then((r) => r.json()),
        fetch(geoUrl).then((r) => r.json()).catch(() => null),
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

      const isDay = (m?.current?.is_day ?? 1) === 1;
      const w: Weather = {
        uv: isDay ? m?.current?.uv_index ?? m?.daily?.uv_index_max?.[0] ?? 0 : 0,
        pm10: c.pm10 ?? 0,
        pm25: c.pm2_5 ?? 0,
        aqi: c.us_aqi ?? 0,
        pollen: pollens,
        humidity: m?.current?.relative_humidity_2m ?? 50,
        temperature: m?.current?.temperature_2m ?? 18,
        wind: m?.current?.wind_speed_10m ?? 0,
        cloud: m?.current?.cloud_cover ?? 0,
        sunrise: m?.daily?.sunrise?.[0] ?? "",
        sunset: m?.daily?.sunset?.[0] ?? "",
        isDay,
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

      setDenied(fallback);
      setUpdatedAt(
        new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
      );
    } catch {
      setDenied(true);
    } finally {
      setLoading(false);
    }
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
    if (coords) fetchAll(coords.lat, coords.lon, denied);
    else requestLocation();
  };

  /* ---------- circadian mode ---------- */
  const circadian: Circadian = useMemo(() => {
    if (!weather) return "day";
    if (!weather.isDay) return "night";
    if (weather.sunset) {
      const sunset = new Date(weather.sunset).getTime();
      const now = Date.now();
      const diffMin = (sunset - now) / 60000;
      if (diffMin >= 0 && diffMin <= 75) return "sunset";
      if (diffMin < 0 && diffMin > -45) return "sunset";
    }
    return "day";
  }, [weather]);

  /* ---------- skin comfort score ---------- */
  const skinScore = useMemo(() => {
    if (!weather) return 86;
    let s = 100;
    if (weather.uv >= 8) s -= 22;
    else if (weather.uv >= 6) s -= 14;
    else if (weather.uv >= 3) s -= 6;
    if (weather.pm25 >= 35) s -= 18;
    else if (weather.pm25 >= 15) s -= 9;
    if (weather.pm10 >= 50) s -= 8;
    if (weather.pollen >= 50) s -= 14;
    else if (weather.pollen >= 20) s -= 8;
    if (weather.humidity < 35) s -= 12;
    else if (weather.humidity > 75) s -= 4;
    if (weather.temperature <= 4) s -= 8;
    else if (weather.temperature >= 30) s -= 4;
    if (weather.wind >= 30) s -= 5;
    return Math.max(28, Math.min(100, Math.round(s)));
  }, [weather]);

  /* ---------- intelligent recommendations ---------- */
  const recommendations = useMemo(() => buildRecommendations(weather, circadian), [weather, circadian]);

  /* ---------- ambient theme tokens ---------- */
  const theme = THEME[circadian];

  /* ---------- hydration risk derived metric ---------- */
  const hydrationRisk = useMemo(() => {
    if (!weather) return 30;
    let r = 0;
    if (weather.humidity < 40) r += (40 - weather.humidity) * 1.6;
    if (weather.wind > 15) r += (weather.wind - 15) * 1.2;
    if (weather.uv > 5) r += (weather.uv - 5) * 3;
    if (weather.temperature > 28) r += (weather.temperature - 28) * 2;
    if (weather.temperature < 6) r += (6 - weather.temperature) * 2;
    return Math.max(5, Math.min(95, Math.round(r)));
  }, [weather]);

  /* ---------- blue light proxy (cloudless midday) ---------- */
  const blueLight = useMemo(() => {
    if (!weather || !weather.isDay) return 0;
    const cloudFactor = 1 - weather.cloud / 100;
    const uvFactor = Math.min(1, weather.uv / 10);
    return Math.round((cloudFactor * 0.6 + uvFactor * 0.4) * 100);
  }, [weather]);

  return (
    <section
      id="grow-with-amarea"
      className={`relative overflow-hidden rounded-[2.5rem] border border-border/60 text-foreground text-left transition-colors duration-700 ${theme.shell}`}
    >
      {/* atmosphere */}
      <AmbientLayer circadian={circadian} />

      <div className="relative px-6 md:px-10 lg:px-14 py-10 md:py-14 lg:py-16">
        {/* ============== HEADER ============== */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
          <div className="max-w-2xl">
            <span className={`inline-flex items-center gap-2 backdrop-blur ${theme.chip} font-body text-[10px] md:text-[11px] font-semibold tracking-[0.22em] uppercase px-3.5 py-1.5 rounded-full border`}>
              <Activity size={11} /> Environmental Skin Insights
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold mt-5 leading-[1.05] tracking-tight">
              La tua pelle, <em className="not-italic text-primary">letta dall'ambiente</em>.
            </h2>
            <p className={`mt-4 font-body text-sm md:text-base max-w-xl leading-relaxed ${theme.muted}`}>
              Un sistema di analisi ambientale in tempo reale che traduce dati atmosferici in
              raccomandazioni skincare scientificamente coerenti.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <CircadianBadge circadian={circadian} sunrise={weather?.sunrise} sunset={weather?.sunset} />
            <div className={`hidden md:inline-flex items-center gap-2 backdrop-blur rounded-full px-3.5 py-2 font-body text-xs ${theme.pill}`}>
              <MapPin size={12} className="text-primary" />
              <span>{place || "Localizzazione…"}</span>
              {updatedAt && <span className="opacity-60">· {updatedAt}</span>}
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              aria-label="Aggiorna dati"
              className={`inline-flex items-center justify-center w-10 h-10 rounded-full backdrop-blur transition-colors disabled:opacity-50 ${theme.pill} hover:bg-primary hover:text-primary-foreground`}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </header>

        {/* ============== HERO DASHBOARD: SCORE + ASSISTANT ============== */}
        <div className="grid lg:grid-cols-[1.35fr_1fr] gap-5 lg:gap-6 mb-6">
          {/* SCORE PANEL */}
          <div className={`relative rounded-[2rem] overflow-hidden border ${theme.glass} p-7 md:p-10`}>
            <div className="flex items-start justify-between gap-6">
              <div>
                <span className={`font-body text-[10px] tracking-[0.24em] uppercase ${theme.muted}`}>
                  Skin Comfort Index
                </span>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="font-display text-7xl md:text-8xl font-semibold tabular-nums leading-none">
                    {skinScore}
                  </span>
                  <span className={`font-body text-xs tracking-wider uppercase ${theme.muted}`}>/ 100</span>
                </div>
                <p className="font-display text-xl md:text-2xl mt-4 max-w-md leading-snug">
                  {scoreNarrative(skinScore, circadian)}
                </p>
              </div>

              {/* subtle botanical assistant */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="hidden md:block relative w-32 lg:w-40 shrink-0"
              >
                <motion.img
                  src={assistantImg}
                  alt=""
                  aria-hidden
                  draggable={false}
                  animate={{ y: [0, -6, 0], rotate: [-1, 1.2, -1] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full h-auto select-none opacity-90 drop-shadow-[0_24px_30px_rgba(0,0,0,0.18)]"
                />
                <motion.div
                  className="absolute inset-0 -z-10 rounded-full blur-3xl"
                  animate={{ opacity: [0.25, 0.5, 0.25] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  style={{ background: "radial-gradient(circle, hsl(var(--primary)/0.4), transparent 65%)" }}
                />
              </motion.div>
            </div>

            {/* score bar */}
            <div className="mt-7">
              <div className={`h-1.5 rounded-full overflow-hidden ${theme.bar}`}>
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-secondary via-primary to-primary"
                  animate={{ width: `${skinScore}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className={`font-body text-[11px] ${theme.muted} tracking-wide`}>
                  Calcolato da UV, PM2.5, pollini, umidità, temperatura, vento.
                </span>
                <span className={`font-body text-[11px] ${theme.muted}`}>
                  {weather ? `Aggiornato · ${updatedAt}` : "Caricamento…"}
                </span>
              </div>
            </div>
          </div>

          {/* PRIMARY VITAL: UV / NIGHT MODE */}
          <div className={`relative rounded-[2rem] overflow-hidden border ${theme.glass} p-7 md:p-9 flex flex-col justify-between`}>
            <div>
              <span className={`font-body text-[10px] tracking-[0.24em] uppercase ${theme.muted}`}>
                {circadian === "night" ? "Modalità notte · recovery" : "Esposizione solare attuale"}
              </span>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="font-display text-6xl md:text-7xl font-semibold tabular-nums leading-none">
                  {circadian === "night" ? "0.0" : weather ? weather.uv.toFixed(1) : "—"}
                </span>
                <span className={`font-body text-sm ${theme.muted}`}>
                  {circadian === "night" ? "UV inattivo" : weather ? uvLabel(weather.uv) : ""}
                </span>
              </div>
            </div>
            <p className={`font-body text-sm mt-5 leading-relaxed ${theme.muted}`}>
              {circadian === "night"
                ? "Il sole è tramontato. La pelle entra in fase rigenerativa: priorità a riparazione e barriera."
                : circadian === "sunset"
                ? "Luce calda di transizione. Riduci l'esposizione e prepara la pelle alla fase di recupero serale."
                : "Indice UV in tempo reale: regola la protezione e l'apporto antiossidante."}
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <MiniStat label="Sunrise" value={fmtTime(weather?.sunrise)} icon={<Sunrise size={12} />} theme={theme} />
              <MiniStat label="Sunset" value={fmtTime(weather?.sunset)} icon={<Sunset size={12} />} theme={theme} />
              <MiniStat label="Blue light" value={`${blueLight}%`} icon={<Eye size={12} />} theme={theme} />
            </div>
          </div>
        </div>

        {/* ============== ENVIRONMENTAL DASHBOARD ============== */}
        <div className="mb-6">
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className={`font-body text-[10px] tracking-[0.22em] uppercase ${theme.muted}`}>
                Skin Weather Dashboard
              </span>
              <h3 className="font-display text-2xl md:text-3xl font-semibold mt-1">
                Indicatori ambientali
              </h3>
            </div>
            <span className={`hidden md:inline font-body text-[11px] ${theme.muted}`}>
              fonte · Open-Meteo
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            <Metric
              theme={theme}
              icon={<Sun size={14} />}
              label="UV Index"
              value={circadian === "night" ? "0.0" : weather ? weather.uv.toFixed(1) : "—"}
              hint={circadian === "night" ? "Notte · inattivo" : weather ? uvLabel(weather.uv) : ""}
              tone={circadian === "night" ? "neutral" : weather && weather.uv >= 6 ? "alert" : "ok"}
            />
            <Metric
              theme={theme}
              icon={<CloudFog size={14} />}
              label="PM2.5"
              value={weather ? weather.pm25.toFixed(0) : "—"}
              unit="µg/m³"
              hint={weather ? pm25Label(weather.pm25) : ""}
              tone={weather && weather.pm25 >= 25 ? "alert" : "ok"}
            />
            <Metric
              theme={theme}
              icon={<Wind size={14} />}
              label="Air Quality"
              value={weather ? Math.round(weather.aqi).toString() : "—"}
              unit="AQI"
              hint={weather ? aqiLabel(weather.aqi) : ""}
              tone={weather && weather.aqi >= 100 ? "alert" : "ok"}
            />
            <Metric
              theme={theme}
              icon={<Flower2 size={14} />}
              label="Pollini"
              value={weather ? weather.pollen.toFixed(1) : "—"}
              unit="grains/m³"
              hint={weather ? pollenLabel(weather.pollen) : ""}
              tone={weather && weather.pollen >= 20 ? "alert" : "ok"}
            />
            <Metric
              theme={theme}
              icon={<Droplets size={14} />}
              label="Umidità"
              value={weather ? Math.round(weather.humidity).toString() : "—"}
              unit="%"
              hint={weather ? humidLabel(weather.humidity) : ""}
              tone={weather && weather.humidity < 35 ? "alert" : "ok"}
            />
            <Metric
              theme={theme}
              icon={<Thermometer size={14} />}
              label="Temperatura"
              value={weather ? `${Math.round(weather.temperature)}°` : "—"}
              unit="C"
              hint={weather ? tempLabel(weather.temperature) : ""}
              tone="neutral"
            />
            <Metric
              theme={theme}
              icon={<Wind size={14} />}
              label="Vento"
              value={weather ? Math.round(weather.wind).toString() : "—"}
              unit="km/h"
              hint={weather ? windLabel(weather.wind) : ""}
              tone={weather && weather.wind >= 25 ? "alert" : "ok"}
            />
            <Metric
              theme={theme}
              icon={<Waves size={14} />}
              label="Hydration risk"
              value={`${hydrationRisk}`}
              unit="%"
              hint={hydrationRisk > 60 ? "Elevato" : hydrationRisk > 35 ? "Medio" : "Basso"}
              tone={hydrationRisk > 60 ? "alert" : "ok"}
            />
            <Metric
              theme={theme}
              icon={<Eye size={14} />}
              label="Blue light"
              value={`${blueLight}`}
              unit="%"
              hint={blueLight > 65 ? "Intensa" : blueLight > 30 ? "Moderata" : "Bassa"}
              tone={blueLight > 65 ? "alert" : "ok"}
            />
            <Metric
              theme={theme}
              icon={circadian === "night" ? <Moon size={14} /> : <Sun size={14} />}
              label="Circadian"
              value={circadian === "night" ? "Notte" : circadian === "sunset" ? "Tramonto" : "Giorno"}
              hint={circadian === "night" ? "Recovery mode" : circadian === "sunset" ? "Transizione" : "Protezione attiva"}
              tone="neutral"
            />
          </div>
        </div>

        {/* ============== INTELLIGENT RECOMMENDATIONS ============== */}
        <div className={`relative rounded-[2rem] border ${theme.glass} p-7 md:p-10`}>
          <div className="flex items-end justify-between mb-6 gap-4">
            <div>
              <span className={`font-body text-[10px] tracking-[0.22em] uppercase ${theme.muted}`}>
                Skincare intelligence
              </span>
              <h3 className="font-display text-2xl md:text-3xl font-semibold mt-1">
                Raccomandazioni personalizzate
              </h3>
            </div>
            <span className={`hidden md:inline-flex items-center gap-1.5 font-body text-[11px] ${theme.muted}`}>
              <ShieldCheck size={12} /> calibrate sul tuo ambiente
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {recommendations.map((r, i) => (
                <motion.div
                  key={r.title}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                  className={`rounded-2xl border p-5 md:p-6 ${theme.card}`}
                >
                  <div className="flex items-center gap-2 text-primary mb-3">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${theme.iconBg}`}>
                      <r.icon size={14} />
                    </span>
                    <span className={`font-body text-[10px] tracking-[0.22em] uppercase ${theme.muted}`}>
                      {r.tag}
                    </span>
                  </div>
                  <h4 className="font-display text-lg md:text-xl font-semibold leading-snug">
                    {r.title}
                  </h4>
                  <p className={`font-body text-sm mt-2 leading-relaxed ${theme.muted}`}>
                    {r.text}
                  </p>
                  <ul className="mt-4 space-y-1.5">
                    {r.steps.map((s) => (
                      <li key={s} className="font-body text-[13px] flex items-start gap-2">
                        <span className="mt-1.5 inline-block w-1 h-1 rounded-full bg-primary shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

/* =========================================================
   THEME (circadian-driven)
   ========================================================= */
const THEME: Record<Circadian, {
  shell: string;
  glass: string;
  card: string;
  pill: string;
  chip: string;
  bar: string;
  iconBg: string;
  muted: string;
}> = {
  day: {
    shell:
      "bg-gradient-to-br from-[hsl(60_30%_97%)] via-[hsl(150_25%_94%)] to-[hsl(60_40%_92%)] shadow-[0_40px_120px_-50px_hsl(var(--primary)/0.35)]",
    glass:
      "border-border/50 bg-background/70 backdrop-blur-xl shadow-[0_2px_30px_-10px_hsl(var(--primary)/0.12)]",
    card: "border-border/50 bg-background/60 backdrop-blur",
    pill: "bg-background/70 border border-border/60 text-foreground/80",
    chip: "bg-background/70 border-primary/20 text-primary",
    bar: "bg-foreground/5",
    iconBg: "bg-primary/10",
    muted: "text-muted-foreground",
  },
  sunset: {
    shell:
      "bg-gradient-to-br from-[hsl(28_55%_94%)] via-[hsl(15_50%_88%)] to-[hsl(280_30%_90%)] shadow-[0_40px_120px_-50px_hsl(var(--accent)/0.4)]",
    glass:
      "border-border/50 bg-background/65 backdrop-blur-xl shadow-[0_2px_30px_-10px_hsl(var(--accent)/0.18)]",
    card: "border-border/50 bg-background/55 backdrop-blur",
    pill: "bg-background/70 border border-border/60 text-foreground/80",
    chip: "bg-background/70 border-accent/30 text-accent",
    bar: "bg-foreground/5",
    iconBg: "bg-primary/10",
    muted: "text-muted-foreground",
  },
  night: {
    shell:
      "bg-gradient-to-br from-[hsl(220_30%_10%)] via-[hsl(240_25%_14%)] to-[hsl(260_25%_12%)] text-[hsl(60_30%_94%)] shadow-[0_40px_120px_-50px_hsl(260_60%_30%/0.7)]",
    glass:
      "border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_2px_40px_-10px_hsl(260_60%_30%/0.4)]",
    card: "border-white/10 bg-white/[0.04] backdrop-blur",
    pill: "bg-white/10 border border-white/10 text-white/80",
    chip: "bg-white/10 border-white/15 text-white/90",
    bar: "bg-white/10",
    iconBg: "bg-white/10",
    muted: "text-white/60",
  },
};

/* =========================================================
   RECOMMENDATIONS ENGINE
   ========================================================= */
function buildRecommendations(w: Weather | null, c: Circadian) {
  if (!w) {
    return [
      {
        tag: "Baseline",
        icon: Droplets,
        title: "Routine bilanciata",
        text: "Mentre leggiamo l'ambiente, mantieni una routine essenziale: detersione, idratazione, protezione.",
        steps: ["Detersione delicata", "Siero idratante", "SPF 30"],
      },
    ];
  }

  type Rec = {
    tag: string;
    icon: typeof Sun;
    title: string;
    text: string;
    steps: string[];
    priority: number;
  };
  const out: Rec[] = [];

  if (c === "night") {
    out.push({
      tag: "Night recovery",
      icon: Moon,
      title: "Riparazione overnight",
      text: "La pelle attiva la rigenerazione cellulare: scegli attivi mirati a sintesi di collagene e barriera.",
      steps: ["Doppia detersione delicata", "Siero retinaldeide o peptidi", "Crema notte ricca / ceramidi"],
      priority: 1,
    });
  } else if (w.uv >= 6) {
    out.push({
      tag: "UV protection",
      icon: Sun,
      title: "Scudo solare e antiossidanti",
      text: `UV ${w.uv.toFixed(1)} (${uvLabel(w.uv)}): rischio elevato di stress ossidativo e fotoinvecchiamento.`,
      steps: ["Siero Vitamina C 10–15%", "SPF 50+ ampio spettro", "Riapplicazione ogni 2 ore"],
      priority: 1,
    });
  } else if (c === "sunset") {
    out.push({
      tag: "Transizione",
      icon: Sunset,
      title: "Prepara la pelle alla notte",
      text: "Luce calda e cortisolo in calo: rimuovi residui della giornata e attiva la fase di recupero.",
      steps: ["Detersione enzimatica", "Tonico riequilibrante", "Siero antiossidante leggero"],
      priority: 1,
    });
  }

  if (w.pm25 >= 15 || w.aqi >= 100) {
    out.push({
      tag: "Anti-pollution",
      icon: CloudFog,
      title: "Detossinare il microbioma",
      text: `PM2.5 ${w.pm25.toFixed(0)} µg/m³ · AQI ${Math.round(w.aqi)}: particolato fine penetra nel poro e altera la barriera.`,
      steps: ["Doppia detersione la sera", "Niacinamide 5%", "Maschera detox 1–2 volte/sett."],
      priority: 2,
    });
  }

  if (w.humidity < 40) {
    out.push({
      tag: "Hydration",
      icon: Droplets,
      title: "Strati di idratazione",
      text: `Umidità ${Math.round(w.humidity)}%: l'aria sottrae acqua transepidermica. Servono umettanti + occlusivi.`,
      steps: ["Mist o essenza", "Siero acido ialuronico multi-peso", "Crema con squalano o ceramidi"],
      priority: 2,
    });
  }

  if (w.temperature <= 6 || w.wind >= 25) {
    out.push({
      tag: "Barrier repair",
      icon: Wind,
      title: "Rinforza la barriera",
      text: `Freddo e vento (${Math.round(w.temperature)}°, ${Math.round(w.wind)} km/h) compromettono i lipidi cutanei.`,
      steps: ["Olio detergente", "Siero centella + pantenolo", "Balsamo ricco / ceramidi NP"],
      priority: 2,
    });
  }

  if (w.humidity > 75 && c !== "night") {
    out.push({
      tag: "Light textures",
      icon: Waves,
      title: "Texture leggere ed equilibrio",
      text: `Umidità ${Math.round(w.humidity)}%: la pelle trattiene già acqua. Evita strati pesanti.`,
      steps: ["Gel detergente", "Siero PHA leggero", "Fluido oil-free SPF"],
      priority: 3,
    });
  }

  if (w.pollen >= 20) {
    out.push({
      tag: "Sensitised skin",
      icon: Flower2,
      title: "Lenitivo e anti-reattivo",
      text: `Pollini ${w.pollen.toFixed(1)} grains/m³ (${pollenLabel(w.pollen)}): possibile aumento di reattività cutanea.`,
      steps: ["Detergente sine acidi", "Siero centella / bisabololo", "Crema barriera senza profumi"],
      priority: 3,
    });
  }

  // ensure at least 3 cards: pad with night-friendly or daily essentials
  if (out.length < 3) {
    out.push({
      tag: c === "night" ? "Microbioma" : "Daily essentials",
      icon: ShieldCheck,
      title: c === "night" ? "Equilibrio del microbioma" : "Routine essenziale",
      text: c === "night"
        ? "Lascia respirare il film idrolipidico: formule a pH fisiologico e prebiotici."
        : "Mantieni i 3 gesti chiave per una pelle stabile e luminosa.",
      steps: c === "night"
        ? ["Detergente pH 5.5", "Essenza prebiotica", "Crema nutriente leggera"]
        : ["Detersione delicata", "Siero idratante", "SPF 30 quotidiano"],
      priority: 4,
    });
  }

  return out.sort((a, b) => a.priority - b.priority).slice(0, 3);
}

/* =========================================================
   SUBCOMPONENTS
   ========================================================= */
const AmbientLayer = ({ circadian }: { circadian: Circadian }) => (
  <>
    {circadian === "day" && (
      <>
        <div className="pointer-events-none absolute -top-32 -right-32 w-[30rem] h-[30rem] rounded-full bg-primary/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 w-[28rem] h-[28rem] rounded-full bg-secondary/15 blur-[120px]" />
      </>
    )}
    {circadian === "sunset" && (
      <>
        <div className="pointer-events-none absolute -top-32 -right-20 w-[30rem] h-[30rem] rounded-full bg-accent/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 w-[30rem] h-[30rem] rounded-full bg-violet/25 blur-[120px]" />
      </>
    )}
    {circadian === "night" && (
      <>
        <div className="pointer-events-none absolute -top-40 -right-40 w-[34rem] h-[34rem] rounded-full bg-violet/30 blur-[140px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 w-[34rem] h-[34rem] rounded-full bg-primary/15 blur-[140px]" />
        <Stars />
      </>
    )}
  </>
);

const Stars = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {Array.from({ length: 24 }).map((_, i) => (
      <motion.span
        key={i}
        className="absolute w-[2px] h-[2px] rounded-full bg-white/70"
        style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }}
        animate={{ opacity: [0.2, 0.9, 0.2] }}
        transition={{ duration: 3 + (i % 4), repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
      />
    ))}
  </div>
);

const CircadianBadge = ({
  circadian,
  sunrise,
  sunset,
}: {
  circadian: Circadian;
  sunrise?: string;
  sunset?: string;
}) => {
  const Icon = circadian === "night" ? Moon : circadian === "sunset" ? Sunset : Sun;
  const label = circadian === "night" ? "Night mode" : circadian === "sunset" ? "Sunset" : "Day mode";
  const sub = circadian === "night"
    ? sunrise ? `Alba ${fmtTime(sunrise)}` : ""
    : sunset ? `Tramonto ${fmtTime(sunset)}` : "";
  return (
    <div className="hidden md:inline-flex items-center gap-2 backdrop-blur rounded-full px-3.5 py-2 font-body text-xs bg-background/70 border border-border/60">
      <Icon size={13} className="text-primary" />
      <span className="font-semibold tracking-wide">{label}</span>
      {sub && <span className="opacity-60">· {sub}</span>}
    </div>
  );
};

const MiniStat = ({
  label,
  value,
  icon,
  theme,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  theme: typeof THEME[Circadian];
}) => (
  <div className={`rounded-xl border ${theme.card} px-3 py-2.5`}>
    <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] ${theme.muted}`}>
      {icon} {label}
    </div>
    <div className="font-display text-base font-semibold mt-0.5 tabular-nums">{value}</div>
  </div>
);

const Metric = ({
  icon,
  label,
  value,
  hint,
  unit,
  tone,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  unit?: string;
  tone?: "ok" | "alert" | "neutral";
  theme: typeof THEME[Circadian];
}) => {
  const dot = tone === "alert" ? "bg-accent" : tone === "ok" ? "bg-primary" : "bg-foreground/40";
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 220, damping: 16 }}
      className={`rounded-2xl border p-4 md:p-5 ${theme.card}`}
    >
      <div className={`flex items-center justify-between text-[10px] font-body font-semibold uppercase tracking-[0.18em] mb-2 ${theme.muted}`}>
        <span className="flex items-center gap-1.5 text-primary">
          {icon}
          {label}
        </span>
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      </div>
      <div className="font-display text-2xl md:text-[1.75rem] font-semibold leading-none tabular-nums">
        {value}
        {unit && <span className={`text-xs font-body font-medium ml-1 ${theme.muted}`}>{unit}</span>}
      </div>
      <div className={`font-body text-[11px] mt-1.5 ${theme.muted}`}>{hint}</div>
    </motion.div>
  );
};

/* =========================================================
   HELPERS
   ========================================================= */
const uvLabel = (v: number) =>
  v < 3 ? "Basso" : v < 6 ? "Moderato" : v < 8 ? "Alto" : v < 11 ? "Molto alto" : "Estremo";
const pm25Label = (v: number) =>
  v < 12 ? "Buona" : v < 25 ? "Discreta" : v < 35 ? "Moderata" : "Inquinata";
const aqiLabel = (v: number) =>
  v < 50 ? "Buona" : v < 100 ? "Moderata" : v < 150 ? "Sensibile" : "Insalubre";
const pollenLabel = (v: number) =>
  v < 5 ? "Bassi" : v < 20 ? "Moderati" : v < 50 ? "Alti" : "Molto alti";
const humidLabel = (v: number) =>
  v < 35 ? "Aria secca" : v < 65 ? "Confortevole" : v < 80 ? "Umida" : "Molto umida";
const tempLabel = (v: number) =>
  v <= 5 ? "Freddo" : v < 18 ? "Fresco" : v < 26 ? "Mite" : v < 32 ? "Caldo" : "Molto caldo";
const windLabel = (v: number) =>
  v < 10 ? "Calmo" : v < 25 ? "Brezza" : v < 40 ? "Forte" : "Intenso";

const fmtTime = (iso?: string) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
};

const scoreNarrative = (s: number, c: Circadian) => {
  if (c === "night") return "La pelle entra in fase di riparazione notturna.";
  if (s >= 85) return "L'ambiente è in armonia con la tua pelle.";
  if (s >= 70) return "Condizioni favorevoli con piccole accortezze.";
  if (s >= 55) return "Stress ambientale moderato: rinforza la barriera.";
  return "Ambiente impegnativo: priorità a protezione e riparazione.";
};

export default PlantGrowthApp;