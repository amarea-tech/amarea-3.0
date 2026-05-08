import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Wind,
  Droplets,
  Flower2,
  Thermometer,
  CloudFog,
  MapPin,
  RefreshCw,
  Mail,
  Check,
  Loader2,
  Sunrise,
  Sunset,
  Moon,
  Monitor,
  Activity,
  Sparkles,
} from "lucide-react";
import Fogliolina, { type Mood } from "@/components/grow/Fogliolina";
import { supabase } from "@/integrations/supabase/client";

/* ---------------- types ---------------- */

type Env = {
  uv: number;
  pm10: number;
  pm25: number;
  aqi: number;
  humidity: number;
  pollen: number;
  wind: number;
  temp: number;
  rain: number;
  isDay: boolean;
  sunrise: string; // ISO
  sunset: string; // ISO
};

type Phase = "dawn" | "day" | "sunset" | "night";

/* Theme tokens per circadian phase */
const PHASE_THEME: Record<
  Phase,
  {
    bg: string;
    surface: string;
    surfaceAlt: string;
    border: string;
    text: string;
    textMuted: string;
    accent: string;
    label: string;
    eyebrow: string;
  }
> = {
  dawn: {
    bg: "linear-gradient(180deg, #F2EBDC 0%, #EFE3D2 60%, #E8D9C5 100%)",
    surface: "#FFFFFF",
    surfaceAlt: "#F7F1E5",
    border: "#E5DCC9",
    text: "#1F2520",
    textMuted: "#6B6457",
    accent: "#C9A877",
    label: "Alba",
    eyebrow: "Sunrise mode",
  },
  day: {
    bg: "linear-gradient(180deg, #F4EFE6 0%, #EFEAE0 100%)",
    surface: "#FFFFFF",
    surfaceAlt: "#F7F2E8",
    border: "#E0DACE",
    text: "#1F2520",
    textMuted: "#5A6157",
    accent: "#A8B89A",
    label: "Giorno",
    eyebrow: "Daylight mode",
  },
  sunset: {
    bg: "linear-gradient(180deg, #EFE0D2 0%, #E6CDB8 60%, #D8B5A0 100%)",
    surface: "#FBF3EA",
    surfaceAlt: "#F2E2CF",
    border: "#DDC4AC",
    text: "#2A201A",
    textMuted: "#6B5A4D",
    accent: "#C99578",
    label: "Tramonto",
    eyebrow: "Sunset mode",
  },
  night: {
    bg: "linear-gradient(180deg, #1A1F22 0%, #14181B 100%)",
    surface: "#1F2528",
    surfaceAlt: "#252B2E",
    border: "#2E3438",
    text: "#EDE7DA",
    textMuted: "#9AA39C",
    accent: "#C9B8D9",
    label: "Notte",
    eyebrow: "Night recovery mode",
  },
};

const FALLBACK = { lat: 43.6158, lon: 13.5189, label: "Ancona, Marche" };

/* ---------------- helpers ---------------- */

const computePhase = (env: Env | null): Phase => {
  if (!env) return "day";
  const now = Date.now();
  const sr = new Date(env.sunrise).getTime();
  const ss = new Date(env.sunset).getTime();
  const dawnEnd = sr + 60 * 60 * 1000;
  const sunsetStart = ss - 60 * 60 * 1000;
  if (now < sr || now > ss) return "night";
  if (now < dawnEnd) return "dawn";
  if (now >= sunsetStart) return "sunset";
  return "day";
};

const aqiFromPm = (pm25: number, pm10: number) => {
  // crude EU-style 1-5 banding
  const a = pm25 < 10 ? 1 : pm25 < 20 ? 2 : pm25 < 25 ? 3 : pm25 < 50 ? 4 : 5;
  const b = pm10 < 20 ? 1 : pm10 < 40 ? 2 : pm10 < 50 ? 3 : pm10 < 100 ? 4 : 5;
  return Math.max(a, b);
};

const aqiLabel = (n: number) =>
  ["—", "Eccellente", "Buona", "Discreta", "Scarsa", "Critica"][n] ?? "—";

const moodFromEnv = (env: Env | null, phase: Phase): Mood => {
  if (!env) return "serene";
  if (phase === "night") return "rainy"; // calmer particles at night
  if (env.uv >= 7) return "uv";
  if (env.pm10 >= 50) return "smog";
  if (env.pollen >= 20) return "pollen";
  if (env.humidity < 40 && env.rain < 0.2) return "dry";
  if (env.rain >= 6) return "rainy";
  return "serene";
};

/* ---------------- skin comfort score ---------------- */

const computeComfort = (env: Env | null, phase: Phase) => {
  if (!env) return 78;
  let s = 100;
  if (phase !== "night") {
    if (env.uv >= 8) s -= 20;
    else if (env.uv >= 6) s -= 12;
    else if (env.uv >= 3) s -= 4;
  }
  if (env.pm25 >= 25) s -= 18;
  else if (env.pm25 >= 10) s -= 8;
  if (env.pollen >= 20) s -= 10;
  else if (env.pollen >= 5) s -= 4;
  if (env.humidity < 30) s -= 14;
  else if (env.humidity < 40) s -= 6;
  else if (env.humidity > 80) s -= 4;
  if (env.wind >= 30) s -= 6;
  if (env.temp < 5 || env.temp > 32) s -= 6;
  return Math.max(28, Math.min(100, Math.round(s)));
};

const hydrationRisk = (env: Env | null) => {
  if (!env) return { level: "—", note: "" };
  const score =
    (env.humidity < 40 ? 2 : env.humidity < 55 ? 1 : 0) +
    (env.wind > 25 ? 2 : env.wind > 15 ? 1 : 0) +
    (env.uv >= 7 ? 1 : 0) +
    (env.temp >= 28 ? 1 : 0);
  if (score >= 4) return { level: "Alto", note: "Barriera sotto stress idrico" };
  if (score >= 2) return { level: "Moderato", note: "Tendenza alla disidratazione" };
  return { level: "Basso", note: "Bilancio idrocutaneo stabile" };
};

const blueLightExposure = (phase: Phase) => {
  if (phase === "night") return { level: "Elevato (schermi)", note: "Schermi attivi: stress ossidativo cumulativo" };
  if (phase === "sunset") return { level: "Moderato", note: "Combina luce blu naturale e digitale" };
  if (phase === "dawn") return { level: "Basso", note: "Esposizione naturale, energia gentile" };
  return { level: "Diurno", note: "Luce blu naturale: integra antiossidanti" };
};

/* ---------------- recommendations ---------------- */

type Reco = { tag: string; title: string; body: string };

const buildRecos = (env: Env | null, phase: Phase): Reco[] => {
  if (!env)
    return [
      { tag: "Routine", title: "Equilibrio", body: "Detersione delicata, idratazione, antiossidante." },
    ];
  const r: Reco[] = [];

  if (phase === "night") {
    r.push({ tag: "Recovery", title: "Riparazione notturna", body: "Retinaldeide o peptidi biomimetici + crema occlusiva con squalano." });
    r.push({ tag: "Microcircolo", title: "Massaggio facciale", body: "Tre minuti di gua sha freddo per drenare e ossigenare i tessuti." });
    if (env.humidity < 45)
      r.push({ tag: "Idratazione", title: "Sleeping mask umettante", body: "Acido ialuronico multipeso + glicerina sotto film leggero." });
    else
      r.push({ tag: "Detossinazione", title: "Maschera detox", body: "Argilla bianca + niacinamide per riequilibrare la microflora." });
    return r;
  }

  if (env.uv >= 6)
    r.push({ tag: "Fotoprotezione", title: "SPF 50 + antiossidanti", body: "Vitamina C 10-15% sotto SPF a finitura velata. Reapply ogni 3h." });
  else
    r.push({ tag: "Fotoprotezione", title: "SPF leggero", body: "SPF 30 fluido, non comedogeno, su siero antiossidante." });

  if (env.pm25 >= 15 || env.pm10 >= 40)
    r.push({ tag: "Anti-pollution", title: "Detersione bifasica + scudo polifenolico", body: "Olio detergente seguito da siero con resveratrolo o estratti upcycled." });

  if (env.humidity < 40)
    r.push({ tag: "Idratazione", title: "Layer umettante + barriera", body: "Acido ialuronico su pelle umida, sigilla con crema a ceramidi." });
  else if (env.humidity > 75)
    r.push({ tag: "Texture", title: "Formulazioni leggere", body: "Gel-cream e sieri acquosi: evita oli pesanti e occlusivi." });

  if (env.wind >= 20 || env.temp <= 8)
    r.push({ tag: "Barriera", title: "Ceramidi e burri vegetali", body: "Crema ricca con ceramidi NP, colesterolo e burro di karité." });

  if (env.pollen >= 20)
    r.push({ tag: "Lenitivo", title: "Routine ipo-reattiva", body: "Centella, bisabololo, zero fragranze. Compresse fredde se serve." });

  return r.slice(0, 4);
};

/* ---------------- pollen formatting ---------------- */

const pollenSeverity = (v: number) =>
  v < 5 ? "Basso" : v < 20 ? "Moderato" : v < 50 ? "Alto" : "Molto alto";

const pollenExplain = (v: number) =>
  v < 5
    ? "Esposizione trascurabile, pelle non reattiva."
    : v < 20
    ? "Possibili microirritazioni in pelli sensibili."
    : "Probabili reazioni cutanee: prediligi texture leniscenti.";

/* ---------------- page ---------------- */

const GrowSection = () => {
  const [env, setEnv] = useState<Env | null>(null);
  const [place, setPlace] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  const fetchAll = async (lat: number, lon: number, fallback = false) => {
    setLoading(true);
    try {
      const meteo = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum,uv_index_max,sunrise,sunset&current=relative_humidity_2m,temperature_2m,wind_speed_10m,is_day&timezone=auto&forecast_days=1`;
      const air = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,grass_pollen,birch_pollen,olive_pollen,alder_pollen,ragweed_pollen&timezone=auto`;
      const geo = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=it&count=1`;

      const [m, a, g] = await Promise.all([
        fetch(meteo).then((r) => r.json()),
        fetch(air).then((r) => r.json()),
        fetch(geo).then((r) => r.json()).catch(() => null),
      ]);

      const c = a?.current ?? {};
      const pollen = [c.grass_pollen, c.birch_pollen, c.olive_pollen, c.alder_pollen, c.ragweed_pollen]
        .filter((v) => typeof v === "number")
        .reduce((s: number, v: number) => s + v, 0);

      const pm10 = c.pm10 ?? 0;
      const pm25 = c.pm2_5 ?? 0;

      const next: Env = {
        uv: m?.daily?.uv_index_max?.[0] ?? 0,
        pm10,
        pm25,
        aqi: aqiFromPm(pm25, pm10),
        humidity: m?.current?.relative_humidity_2m ?? 50,
        pollen,
        wind: m?.current?.wind_speed_10m ?? 0,
        temp: m?.current?.temperature_2m ?? 18,
        rain: m?.daily?.precipitation_sum?.[0] ?? 0,
        isDay: !!m?.current?.is_day,
        sunrise: m?.daily?.sunrise?.[0] ?? new Date().toISOString(),
        sunset: m?.daily?.sunset?.[0] ?? new Date().toISOString(),
      };
      setEnv(next);
      setCoords({ lat, lon });
      const first = g?.results?.[0];
      setPlace(first ? `${first.name}, ${first.admin1 ?? first.country ?? ""}` : fallback ? FALLBACK.label : `${lat.toFixed(2)}, ${lon.toFixed(2)}`);
      setUpdatedAt(new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
    } finally {
      setLoading(false);
    }
  };

  const requestLoc = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      fetchAll(FALLBACK.lat, FALLBACK.lon, true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => fetchAll(p.coords.latitude, p.coords.longitude),
      () => fetchAll(FALLBACK.lat, FALLBACK.lon, true),
      { timeout: 7000, maximumAge: 600_000 },
    );
  };

  useEffect(() => {
    requestLoc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phase = useMemo(() => computePhase(env), [env]);
  const theme = PHASE_THEME[phase];
  const isNight = phase === "night";
  const mood = useMemo(() => moodFromEnv(env, phase), [env, phase]);
  const comfort = useMemo(() => computeComfort(env, phase), [env, phase]);
  const hydra = useMemo(() => hydrationRisk(env), [env]);
  const blue = useMemo(() => blueLightExposure(phase), [phase]);
  const recos = useMemo(() => buildRecos(env, phase), [env, phase]);

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

  const uvDisplay = isNight ? "0.0" : env ? env.uv.toFixed(1) : "—";
  const uvHint = isNight ? "Inattivo (notte)" : env ? (env.uv < 3 ? "Basso" : env.uv < 6 ? "Moderato" : env.uv < 8 ? "Alto" : "Molto alto") : "";

  return (
    <div
      id="grow"
      className="transition-colors duration-700"
      style={{ background: theme.bg, color: theme.text }}
    >
      {/* ======= HERO HEADER ======= */}
      <header className="pt-20 md:pt-28 pb-10 md:pb-14">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <span
                className="text-[10px] tracking-[0.35em] uppercase font-body"
                style={{ color: theme.textMuted }}
              >
                Amarea · Environmental Skin Insights
              </span>
              <h1
                className="font-display text-4xl md:text-6xl mt-3 leading-[1.05]"
                style={{ color: theme.text }}
              >
                Skin Weather <span className="italic font-light">Dashboard</span>
              </h1>
              <div
                className="flex items-center gap-3 mt-4 font-body text-sm"
                style={{ color: theme.textMuted }}
              >
                <MapPin size={14} />
                <span>{place || "Localizzazione in corso…"}</span>
                {updatedAt && <span className="opacity-70">· aggiornato {updatedAt}</span>}
                <button
                  onClick={() => (coords ? fetchAll(coords.lat, coords.lon) : requestLoc())}
                  disabled={loading}
                  className="ml-1 inline-flex items-center gap-1.5 hover:underline underline-offset-4"
                  style={{ color: theme.text }}
                >
                  <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> aggiorna
                </button>
              </div>
            </div>

            {/* Phase badge */}
            <div
              className="rounded-full px-5 py-2.5 flex items-center gap-3 backdrop-blur-md border"
              style={{
                background: isNight ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.55)",
                borderColor: theme.border,
              }}
            >
              <PhaseIcon phase={phase} />
              <div className="leading-tight">
                <div className="text-[9px] tracking-[0.3em] uppercase font-body" style={{ color: theme.textMuted }}>
                  Circadian skin mode
                </div>
                <div className="font-display text-sm" style={{ color: theme.text }}>{theme.eyebrow}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ======= PRIMARY ROW: Comfort score + Assistant + Quick stats ======= */}
      <section className="pb-12">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
            {/* Comfort Score card */}
            <GlassCard theme={theme}>
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div>
                  <Eyebrow theme={theme}>Skin Comfort Score</Eyebrow>
                  <div className="flex items-baseline gap-3 mt-3">
                    <div className="font-display text-7xl md:text-8xl leading-none" style={{ color: theme.text }}>
                      {comfort}
                    </div>
                    <div className="font-body text-sm" style={{ color: theme.textMuted }}>/ 100</div>
                  </div>
                  <p className="font-body text-sm mt-3 max-w-xs leading-relaxed" style={{ color: theme.textMuted }}>
                    {comfort >= 80
                      ? "Condizioni favorevoli: la pelle è in equilibrio."
                      : comfort >= 60
                      ? "Stress moderato: ottimizza la routine in base agli indicatori."
                      : "Stress elevato: priorità a barriera, idratazione e protezione."}
                  </p>
                </div>

                {/* Botanical assistant — subtle, small, side */}
                <div className="ml-auto -mr-2 -mt-2 opacity-90">
                  <Fogliolina mood={mood} size={170} />
                </div>
              </div>

              {/* Sub-row: 3 derived insights */}
              <div className="grid grid-cols-3 gap-px mt-8 rounded-2xl overflow-hidden" style={{ background: theme.border }}>
                <SubInsight theme={theme} icon={<Droplets size={14} />} label="Hydration risk" value={hydra.level} note={hydra.note} />
                <SubInsight theme={theme} icon={<Monitor size={14} />} label="Blue light" value={blue.level} note={blue.note} />
                <SubInsight
                  theme={theme}
                  icon={<Activity size={14} />}
                  label="Air quality (EU)"
                  value={env ? aqiLabel(env.aqi) : "—"}
                  note={env ? `Indice ${env.aqi}/5` : ""}
                />
              </div>
            </GlassCard>

            {/* Sun cycle card */}
            <GlassCard theme={theme}>
              <Eyebrow theme={theme}>Ciclo solare</Eyebrow>
              <div className="mt-5 flex items-center justify-between">
                <SunPoint theme={theme} icon={<Sunrise size={18} />} label="Alba" value={env ? fmtTime(env.sunrise) : "—"} />
                <SunArc phase={phase} theme={theme} />
                <SunPoint theme={theme} icon={<Sunset size={18} />} label="Tramonto" value={env ? fmtTime(env.sunset) : "—"} />
              </div>
              <p className="font-body text-xs mt-6 leading-relaxed" style={{ color: theme.textMuted }}>
                {isNight
                  ? "Modalità notte attiva: l'interfaccia favorisce ingredienti riparativi e luce ambientale calda."
                  : phase === "sunset"
                  ? "Tramonto: la pelle entra in fase di transizione, valuta antiossidanti."
                  : phase === "dawn"
                  ? "Alba: il microcircolo cutaneo si riattiva, idratazione prima di tutto."
                  : "Ore diurne: protezione e antiossidanti restano la priorità."}
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ======= ENVIRONMENTAL DASHBOARD GRID ======= */}
      <section className="pb-12">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-6">
            <Eyebrow theme={theme}>Indicatori ambientali</Eyebrow>
            <span className="font-body text-[10px] tracking-[0.25em] uppercase" style={{ color: theme.textMuted }}>
              Real-time · Open-Meteo
            </span>
          </div>

          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px rounded-3xl overflow-hidden border"
            style={{ background: theme.border, borderColor: theme.border }}
          >
            <Metric theme={theme} icon={<Sun size={16} />} label="UV Index" value={uvDisplay} unit="UVI" hint={uvHint} dim={isNight} />
            <Metric
              theme={theme}
              icon={<CloudFog size={16} />}
              label="PM2.5"
              value={env ? env.pm25.toFixed(1) : "—"}
              unit="µg/m³"
              hint={env ? (env.pm25 < 10 ? "OMS: nei limiti" : env.pm25 < 25 ? "Sopra OMS" : "Critico") : ""}
            />
            <Metric
              theme={theme}
              icon={<CloudFog size={16} />}
              label="PM10"
              value={env ? env.pm10.toFixed(0) : "—"}
              unit="µg/m³"
              hint={env ? (env.pm10 < 25 ? "Aria pulita" : env.pm10 < 50 ? "Discreta" : "Carica") : ""}
            />
            <Metric
              theme={theme}
              icon={<Flower2 size={16} />}
              label="Pollen"
              value={env ? env.pollen.toFixed(1) : "—"}
              unit="grains/m³"
              hint={env ? `${pollenSeverity(env.pollen)} · ${pollenExplain(env.pollen)}` : ""}
              wide
            />
            <Metric theme={theme} icon={<Droplets size={16} />} label="Humidity" value={env ? env.humidity.toFixed(0) : "—"} unit="%" hint={env ? (env.humidity < 40 ? "Aria secca" : env.humidity < 70 ? "Equilibrata" : "Umida") : ""} />
            <Metric theme={theme} icon={<Thermometer size={16} />} label="Temperature" value={env ? env.temp.toFixed(0) : "—"} unit="°C" hint={env ? (env.temp < 10 ? "Fresco" : env.temp < 22 ? "Mite" : env.temp < 30 ? "Caldo" : "Torrido") : ""} />
            <Metric theme={theme} icon={<Wind size={16} />} label="Wind" value={env ? env.wind.toFixed(0) : "—"} unit="km/h" hint={env ? (env.wind < 10 ? "Calmo" : env.wind < 25 ? "Brezza" : "Forte") : ""} />
            <Metric theme={theme} icon={<Activity size={16} />} label="Air Quality" value={env ? `${env.aqi}/5` : "—"} unit={env ? aqiLabel(env.aqi) : ""} hint="Indice EU PM2.5/PM10" />
          </div>
        </div>
      </section>

      {/* ======= SMART RECOMMENDATIONS ======= */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <Eyebrow theme={theme}>Smart skincare protocol</Eyebrow>
              <h2 className="font-display text-2xl md:text-4xl mt-2" style={{ color: theme.text }}>
                {isNight ? "Protocollo di recupero notturno" : "Routine adattiva per oggi"}
              </h2>
            </div>
            <span className="font-body text-[10px] tracking-[0.25em] uppercase hidden md:inline" style={{ color: theme.textMuted }}>
              {recos.length} azioni consigliate
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {recos.map((r, i) => (
                <motion.article
                  key={r.title}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="rounded-2xl p-6 border backdrop-blur-md"
                  style={{
                    background: isNight ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.6)",
                    borderColor: theme.border,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={12} style={{ color: theme.accent }} />
                    <span className="text-[10px] tracking-[0.25em] uppercase font-body" style={{ color: theme.textMuted }}>
                      {r.tag}
                    </span>
                  </div>
                  <h3 className="font-display text-xl mt-3 leading-snug" style={{ color: theme.text }}>
                    {r.title}
                  </h3>
                  <p className="font-body text-sm mt-3 leading-relaxed" style={{ color: theme.textMuted }}>
                    {r.body}
                  </p>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ======= NEWSLETTER (untouched rectangle) ======= */}
      <NewsletterBlock />
    </div>
  );
};

/* ---------------- atoms ---------------- */

const Eyebrow = ({ children, theme }: { children: React.ReactNode; theme: typeof PHASE_THEME["day"] }) => (
  <span className="text-[10px] tracking-[0.3em] uppercase font-body" style={{ color: theme.textMuted }}>
    {children}
  </span>
);

const GlassCard = ({ children, theme }: { children: React.ReactNode; theme: typeof PHASE_THEME["day"] }) => {
  const isNight = theme.label === "Notte";
  return (
    <div
      className="rounded-3xl border backdrop-blur-xl p-7 md:p-9"
      style={{
        background: isNight ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.65)",
        borderColor: theme.border,
        boxShadow: isNight
          ? "0 30px 80px -40px rgba(0,0,0,0.6)"
          : "0 30px 60px -40px rgba(31,37,32,0.18)",
      }}
    >
      {children}
    </div>
  );
};

const SubInsight = ({
  theme,
  icon,
  label,
  value,
  note,
}: {
  theme: typeof PHASE_THEME["day"];
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) => {
  const isNight = theme.label === "Notte";
  return (
    <div
      className="p-5"
      style={{ background: isNight ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)" }}
    >
      <div className="flex items-center gap-1.5" style={{ color: theme.textMuted }}>
        {icon}
        <span className="text-[9px] tracking-[0.3em] uppercase font-body">{label}</span>
      </div>
      <div className="font-display text-lg mt-2" style={{ color: theme.text }}>{value}</div>
      <div className="font-body text-[11px] mt-1 leading-snug" style={{ color: theme.textMuted }}>{note}</div>
    </div>
  );
};

const Metric = ({
  theme,
  icon,
  label,
  value,
  unit,
  hint,
  wide,
  dim,
}: {
  theme: typeof PHASE_THEME["day"];
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  hint: string;
  wide?: boolean;
  dim?: boolean;
}) => {
  const isNight = theme.label === "Notte";
  return (
    <div
      className={`p-6 transition-colors ${wide ? "md:col-span-2" : ""}`}
      style={{
        background: isNight ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)",
        opacity: dim ? 0.55 : 1,
      }}
    >
      <div className="flex items-center gap-1.5" style={{ color: theme.textMuted }}>
        {icon}
        <span className="text-[9px] tracking-[0.3em] uppercase font-body">{label}</span>
      </div>
      <div className="flex items-baseline gap-2 mt-3">
        <span className="font-display text-3xl md:text-4xl leading-none" style={{ color: theme.text }}>{value}</span>
        <span className="font-body text-[11px] tracking-wide" style={{ color: theme.textMuted }}>{unit}</span>
      </div>
      <div className="font-body text-[11px] mt-2 leading-snug" style={{ color: theme.textMuted }}>{hint}</div>
    </div>
  );
};

const PhaseIcon = ({ phase }: { phase: Phase }) => {
  const props = { size: 18 };
  if (phase === "night") return <Moon {...props} className="text-[#C9B8D9]" />;
  if (phase === "sunset") return <Sunset {...props} className="text-[#C99578]" />;
  if (phase === "dawn") return <Sunrise {...props} className="text-[#C9A877]" />;
  return <Sun {...props} className="text-[#A8B89A]" />;
};

const SunPoint = ({
  theme,
  icon,
  label,
  value,
}: {
  theme: typeof PHASE_THEME["day"];
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="text-center">
    <div className="inline-flex" style={{ color: theme.accent }}>{icon}</div>
    <div className="text-[9px] tracking-[0.3em] uppercase font-body mt-1" style={{ color: theme.textMuted }}>{label}</div>
    <div className="font-display text-base mt-1" style={{ color: theme.text }}>{value}</div>
  </div>
);

const SunArc = ({ phase, theme }: { phase: Phase; theme: typeof PHASE_THEME["day"] }) => {
  const pos = phase === "dawn" ? 0.15 : phase === "day" ? 0.5 : phase === "sunset" ? 0.85 : 1.05;
  const x = 20 + pos * 160;
  const y = 60 - Math.sin(Math.min(1, pos) * Math.PI) * 40;
  return (
    <svg viewBox="0 0 200 70" className="w-44 h-16">
      <path d="M20 60 Q100 -20 180 60" fill="none" stroke={theme.border} strokeWidth="1.5" strokeDasharray="3 4" />
      <circle cx={x} cy={y} r="6" fill={theme.accent} opacity="0.9" />
      <circle cx={x} cy={y} r="11" fill={theme.accent} opacity="0.18" />
    </svg>
  );
};

/* ---------------- newsletter (kept exactly) ---------------- */

const NewsletterBlock = () => {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setResult({ type: "error", msg: "Inserisci un indirizzo email valido." });
      return;
    }
    if (!consent) {
      setResult({ type: "error", msg: "Spunta il consenso al trattamento dei dati per continuare." });
      return;
    }
    setSubscribing(true);
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-subscribe", { body: { email, consent } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult({ type: "success", msg: "Iscrizione confermata. Controlla la tua casella per la mail di benvenuto." });
      setEmail("");
      setConsent(false);
    } catch (err) {
      setResult({ type: "error", msg: err instanceof Error ? err.message : "Riprova tra poco." });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <section className="border-t border-[#E0DACE] bg-[#F4EFE6]">
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-20 md:py-28 text-center">
        <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-[#6B7864] font-body">
          <Mail size={13} /> Newsletter
        </span>
        <h3 className="font-display text-3xl md:text-5xl text-[#1F2520] mt-4 leading-tight">
          Tienimi aggiornato.
        </h3>
        <p className="font-body text-sm md:text-base text-[#5A6157] mt-3 max-w-md mx-auto leading-relaxed">
          Ricerca, rituali e nuove uscite di <span className="italic">Monti Italiani</span>. Una mail al mese, mai di più.
        </p>

        <form onSubmit={submit} className="mt-8 flex flex-col gap-3 max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="la-tua-email@esempio.it"
              maxLength={255}
              className="flex-1 rounded-full bg-white border border-[#E0DACE] px-5 py-3 font-body text-sm text-[#1F2520] placeholder:text-[#A8987C] focus:outline-none focus:border-[#A8B89A] transition-colors"
            />
            <button
              type="submit"
              disabled={subscribing}
              className="inline-flex items-center justify-center gap-2 bg-[#1F2520] text-[#F4EFE6] font-body font-medium text-sm px-6 py-3 rounded-full hover:bg-[#2A312A] transition-colors disabled:opacity-60"
            >
              {subscribing ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
              Tienimi aggiornato
            </button>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer group select-none text-left">
            <span
              className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-[4px] border transition-all flex items-center justify-center ${
                consent ? "bg-[#1F2520] border-[#1F2520]" : "bg-white border-[#E0DACE] group-hover:border-[#A8B89A]"
              }`}
            >
              {consent && <Check size={12} className="text-[#F4EFE6]" strokeWidth={3} />}
            </span>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="sr-only" />
            <span className="font-body text-xs text-[#5A6157] leading-relaxed">
              Acconsento al trattamento dei miei dati personali per ricevere la newsletter, ai sensi della Privacy Policy.
            </span>
          </label>

          <AnimatePresence mode="wait">
            {result && (
              <motion.p
                key={result.msg}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`font-body text-xs ${result.type === "success" ? "text-[#5A7558]" : "text-[#A85C5C]"}`}
              >
                {result.msg}
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </div>
    </section>
  );
};

export default GrowSection;