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
  Leaf,
  ShieldCheck,
  Users,
  Network,
  Smartphone,
  ArrowRight,
  Thermometer,
} from "lucide-react";
import happyImg from "@/assets/fogliolina/happy.png";
import uvImg from "@/assets/fogliolina/uv.png";
import dryImg from "@/assets/fogliolina/dry.png";
import smogImg from "@/assets/fogliolina/smog.png";
import pollenImg from "@/assets/fogliolina/pollen.png";

type Weather = {
  rain: number;
  uv: number;
  smog: number;
  pollen: number;
  humidity: number;
  temperature: number;
  wind: number;
};

type StateKey = "loading" | "denied" | "happy" | "uv" | "smog" | "pollen" | "dry" | "cold";

const MOOD: Record<
  StateKey,
  {
    img: string;
    title: string;
    feel: string;
    advice: string;
    routine: string[];
    accent: string;
  }
> = {
  loading: {
    img: happyImg,
    title: "Fogliolina sta osservando il tuo cielo…",
    feel: "Un istante: stiamo leggendo l'aria intorno a te.",
    advice: "Preparati a scoprire come si sente la tua pelle oggi.",
    routine: [],
    accent: "from-secondary/20 to-primary/10",
  },
  denied: {
    img: happyImg,
    title: "Posizione non disponibile",
    feel: "Mostriamo dati indicativi delle Marche. Concedi la geolocalizzazione per dati locali.",
    advice: "La routine consigliata oggi è leggera, equilibrata e idratante.",
    routine: ["Detersione delicata", "Siero antiossidante", "Crema idratante"],
    accent: "from-secondary/20 to-primary/10",
  },
  happy: {
    img: happyImg,
    title: "Oggi la tua pelle si sente in equilibrio",
    feel: "Sole gentile, aria pulita: Fogliolina sorride insieme a te.",
    advice: "È il momento perfetto per nutrire la pelle con gesti semplici e mirati.",
    routine: ["Detersione delicata", "Essenza idratante", "SPF 30 leggero"],
    accent: "from-primary/15 to-secondary/15",
  },
  uv: {
    img: uvImg,
    title: "I raggi UV sono intensi",
    feel: "Fogliolina sente il sole sulle guance: la tua pelle ha bisogno di scudo.",
    advice: "Proteggi la barriera cutanea con un filtro alto e antiossidanti.",
    routine: ["SPF 50+ ampio spettro", "Siero alla Vitamina C", "After-sun lenitivo"],
    accent: "from-secondary/30 to-accent/10",
  },
  dry: {
    img: dryImg,
    title: "L'aria è secca, la pelle ha sete",
    feel: "Fogliolina ha le foglie un po' assetate: ricarichiamo l'idratazione.",
    advice: "Strati di idratazione leggeri sigillati da un olio biotech.",
    routine: ["Mist all'acqua di vinaccia", "Siero acido ialuronico", "Olio nutriente upcycled"],
    accent: "from-sky/20 to-primary/10",
  },
  smog: {
    img: smogImg,
    title: "Aria pesante, pelle sotto stress",
    feel: "Fogliolina alza lo scudo di foglie: lo smog stressa il microbioma.",
    advice: "Detossina la sera con texture leggere e attivi antiossidanti.",
    routine: ["Doppia detersione", "Siero polifenoli (vinacce)", "Maschera detox"],
    accent: "from-muted/40 to-primary/10",
  },
  pollen: {
    img: pollenImg,
    title: "Pollini in volo, pelle sensibile",
    feel: "Fogliolina è circondata da pollini: la pelle può reagire più del solito.",
    advice: "Scegli formule lenitive e detergenti soft, evita scrub e acidi forti.",
    routine: ["Detergente lenitivo", "Siero centella", "Crema barriera"],
    accent: "from-violet/20 to-secondary/10",
  },
  cold: {
    img: dryImg,
    title: "Freddo intenso, barriera in allerta",
    feel: "Fogliolina si stringe nel mantello di foglie: protezione attiva.",
    advice: "Texture più ricche, balsami e oli per sigillare l'idratazione.",
    routine: ["Olio detergente", "Crema ricca rigenerante", "Balsamo labbra"],
    accent: "from-sky/20 to-violet/15",
  },
};

const FALLBACK = { lat: 43.6158, lon: 13.5189, label: "Ancona, IT" };

const PlantGrowthApp = () => {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [place, setPlace] = useState("");
  const [status, setStatus] = useState<StateKey>("loading");
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(false);

  const deriveStatus = (w: Weather, fallback: boolean): StateKey => {
    if (w.uv >= 7) return "uv";
    if (w.smog >= 50) return "smog";
    if (w.pollen >= 20) return "pollen";
    if (w.temperature <= 5) return "cold";
    if (w.humidity < 40 && w.rain < 0.2) return "dry";
    if (fallback) return "denied";
    return "happy";
  };

  const fetchAll = async (lat: number, lon: number, fallback = false) => {
    setLoading(true);
    try {
      const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum,uv_index_max&current=relative_humidity_2m,temperature_2m,wind_speed_10m&timezone=auto&forecast_days=1`;
      const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,grass_pollen,birch_pollen,olive_pollen,alder_pollen,ragweed_pollen&timezone=auto`;
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

      const w: Weather = {
        rain: m?.daily?.precipitation_sum?.[0] ?? 0,
        uv: m?.daily?.uv_index_max?.[0] ?? 0,
        smog: c.pm10 ?? 0,
        pollen: pollens,
        humidity: m?.current?.relative_humidity_2m ?? 50,
        temperature: m?.current?.temperature_2m ?? 18,
        wind: m?.current?.wind_speed_10m ?? 0,
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
        new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
      );
    } catch {
      setStatus("denied");
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
    if (coords) fetchAll(coords.lat, coords.lon);
    else requestLocation();
  };

  const mood = MOOD[status];

  const skinScore = useMemo(() => {
    if (!weather) return 86;
    let s = 100;
    if (weather.uv >= 7) s -= 18;
    else if (weather.uv >= 5) s -= 8;
    if (weather.smog >= 50) s -= 18;
    else if (weather.smog >= 25) s -= 7;
    if (weather.pollen >= 20) s -= 12;
    if (weather.humidity < 40) s -= 10;
    if (weather.temperature <= 5) s -= 6;
    if (weather.wind >= 25) s -= 4;
    return Math.max(28, Math.min(100, Math.round(s)));
  }, [weather]);

  return (
    <section
      id="grow-with-amarea"
      className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-background via-background to-secondary/5 text-foreground border border-border/60 shadow-[0_40px_120px_-40px_hsl(var(--primary)/0.35)] text-left"
    >
      {/* atmosphere */}
      <div className="pointer-events-none absolute -top-40 -right-32 w-[28rem] h-[28rem] rounded-full bg-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 w-[28rem] h-[28rem] rounded-full bg-violet/20 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full bg-secondary/10 blur-[140px]" />

      <div className="relative px-6 md:px-12 lg:px-16 py-12 md:py-16 lg:py-20">
        {/* ============== HERO ============== */}
        <header className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span className="inline-flex items-center gap-2 backdrop-blur bg-background/70 text-primary font-body text-[11px] md:text-xs font-semibold tracking-[0.18em] uppercase px-4 py-1.5 rounded-full border border-primary/20">
            <Sparkles size={12} /> Grow With Amarea
          </span>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mt-5 leading-[1.05] tracking-tight">
            Conosci <em className="not-italic text-primary">Fogliolina</em>,
            <br className="hidden md:block" />
            la tua compagna di pelle.
          </h2>
          <p className="mt-5 font-body text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Una mascotte viva che reagisce all'ambiente intorno a te e ti suggerisce, in tempo reale,
            la routine skincare più adatta al tuo cielo.
          </p>
        </header>

        {/* ============== MASCOT + WEATHER CARD ============== */}
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-10 items-stretch mb-10">
          {/* MASCOT STAGE */}
          <div
            className={`relative rounded-[2rem] border border-border/60 overflow-hidden bg-gradient-to-br ${mood.accent} backdrop-blur-xl`}
          >
            {/* glassmorphic glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--background)/0.6),transparent_60%)]" />
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[80%] h-40 rounded-full bg-primary/20 blur-3xl opacity-60" />

            {/* location */}
            <div className="relative flex items-center justify-between px-6 pt-6 z-10">
              <div className="inline-flex items-center gap-2 bg-background/70 backdrop-blur border border-border/60 rounded-full px-3 py-1.5 font-body text-xs text-foreground/80">
                <MapPin size={12} className="text-primary" />
                <span>{place || "Localizzazione…"}</span>
                {updatedAt && <span className="opacity-60">· {updatedAt}</span>}
              </div>
              <button
                onClick={refresh}
                disabled={loading}
                aria-label="Aggiorna dati"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-background/70 backdrop-blur border border-border/60 hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            {/* mascot */}
            <div className="relative flex items-end justify-center min-h-[420px] md:min-h-[520px] pb-8 px-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={status}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 110, damping: 16 }}
                  className="relative"
                >
                  {/* breathing/float wrapper */}
                  <motion.div
                    animate={{ y: [0, -10, 0], rotate: [-1.2, 1.2, -1.2] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    {/* soft halo glow */}
                    <motion.div
                      animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.05, 1] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 -z-10 rounded-full bg-gradient-to-t from-primary/30 via-secondary/20 to-transparent blur-3xl"
                    />
                    <img
                      src={mood.img}
                      alt="Fogliolina, mascotte botanica Amarea"
                      className="w-[280px] md:w-[360px] lg:w-[400px] h-auto select-none drop-shadow-[0_30px_30px_rgba(0,0,0,0.18)]"
                      draggable={false}
                    />
                    {/* blink overlay (subtle eyelid pulse via opacity flicker) */}
                    <motion.div
                      className="pointer-events-none absolute inset-0"
                      animate={{ opacity: [0, 0, 0, 0.06, 0] }}
                      transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", times: [0, 0.85, 0.9, 0.93, 1] }}
                      style={{ background: "linear-gradient(to bottom, transparent 38%, hsl(var(--foreground)/0.5) 41%, transparent 44%)" }}
                    />
                  </motion.div>

                  {/* ambient particles per mood */}
                  {status === "uv" && <SunRays />}
                  {status === "pollen" && <Particles color="violet" />}
                  {status === "smog" && <Particles color="muted" />}
                  {status === "dry" && <Particles color="sky" />}
                  {status === "cold" && <Particles color="sky" />}
                  {status === "happy" && <Sparkle />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* TODAY YOUR SKIN FEELS CARD */}
          <div className="flex flex-col gap-5">
            <div className="rounded-[2rem] border border-border/60 bg-background/80 backdrop-blur-xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="font-body text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
                  Oggi la tua pelle si sente
                </span>
                <span className="font-display text-3xl md:text-4xl font-bold text-primary tabular-nums">
                  {skinScore}
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={status + "-feel"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                >
                  <h3 className="font-display text-2xl md:text-3xl font-semibold leading-snug">
                    {mood.title}
                  </h3>
                  <p className="font-body text-sm md:text-base text-muted-foreground mt-3 leading-relaxed">
                    {mood.feel}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-5 h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-secondary via-primary to-primary"
                  animate={{ width: `${skinScore}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              </div>
              <p className="font-body text-[11px] text-muted-foreground mt-2 tracking-wide">
                Skin Comfort Index · calcolato da UV, smog, umidità, temperatura, pollini.
              </p>
            </div>

            {/* SKINCARE SUGGESTIONS */}
            <div className="rounded-[2rem] border border-border/60 bg-background/80 backdrop-blur-xl p-6 md:p-7 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-primary">
                <ShieldCheck size={16} />
                <span className="font-body text-[11px] tracking-[0.2em] uppercase">
                  Routine consigliata
                </span>
              </div>
              <p className="font-body text-sm text-muted-foreground mb-4 leading-relaxed">
                {mood.advice}
              </p>
              <ul className="space-y-2.5">
                {(mood.routine.length ? mood.routine : ["Detersione delicata", "Siero idratante", "SPF 30"]).map(
                  (step, i) => (
                    <li
                      key={step}
                      className="flex items-center gap-3 font-body text-sm text-foreground/90"
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-display text-xs font-bold">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* ============== ENVIRONMENTAL DASHBOARD ============== */}
        <div className="mb-12 md:mb-16">
          <div className="flex items-end justify-between mb-5">
            <div>
              <span className="font-body text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
                Skin Weather Dashboard
              </span>
              <h3 className="font-display text-2xl md:text-3xl font-semibold mt-1">
                L'aria intorno a te, in tempo reale
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            <Metric icon={<Sun size={16} />} label="UV" value={weather ? weather.uv.toFixed(1) : "—"} hint={weather ? uvLabel(weather.uv) : ""} />
            <Metric icon={<Wind size={16} />} label="Smog" value={weather ? `${weather.smog.toFixed(0)}` : "—"} unit="µg/m³" hint={weather ? smogLabel(weather.smog) : ""} />
            <Metric icon={<Flower2 size={16} />} label="Pollini" value={weather ? weather.pollen.toFixed(0) : "—"} hint={weather ? pollenLabel(weather.pollen) : ""} />
            <Metric icon={<Droplets size={16} />} label="Umidità" value={weather ? `${Math.round(weather.humidity)}` : "—"} unit="%" hint={weather ? humidLabel(weather.humidity) : ""} />
            <Metric icon={<Thermometer size={16} />} label="Temp." value={weather ? `${Math.round(weather.temperature)}°` : "—"} hint={weather ? tempLabel(weather.temperature) : ""} />
            <Metric icon={<Wind size={16} />} label="Vento" value={weather ? `${Math.round(weather.wind)}` : "—"} unit="km/h" hint={weather ? windLabel(weather.wind) : ""} />
          </div>
          <p className="font-body text-[11px] text-muted-foreground text-center mt-4">
            Dati ambientali · Open-Meteo
          </p>
        </div>

        {/* ============== COMMUNITY + NETWORK + NFC ============== */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-5 mb-12">
          <ExperienceCard
            icon={<Users size={18} />}
            tag="Community"
            title="Grow With Amarea"
            text="Una community di skincare science lovers che condivide rituali, dati pelle e scoperte botaniche delle Marche."
          />
          <ExperienceCard
            icon={<Network size={18} />}
            tag="Network"
            title="Startup & Ricerca"
            text="Collaboriamo con università, biotech e brand etici. Diventa parte del nostro ecosistema di innovazione naturale."
          />
          <ExperienceCard
            icon={<Smartphone size={18} />}
            tag="NFC"
            title="Tap the lid"
            text="Avvicina il telefono al tappo Amarea: Fogliolina riconosce il tuo prodotto e attiva il rituale dedicato."
          />
        </div>

        {/* ============== CTA ============== */}
        <div className="relative rounded-[2rem] overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 via-secondary/10 to-violet/10 backdrop-blur-xl p-8 md:p-12 text-center">
          <Leaf className="absolute top-6 left-6 text-primary/30" size={28} />
          <Leaf className="absolute bottom-6 right-6 text-primary/30 rotate-180" size={28} />
          <h3 className="font-display text-3xl md:text-5xl font-semibold tracking-tight">
            Grow with us.
          </h3>
          <p className="font-body text-base md:text-lg text-muted-foreground mt-3 max-w-xl mx-auto">
            Entra nell'ecosistema Amarea: scienza naturale, upcycling delle Marche e una pelle che cresce con te.
          </p>
          <button className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold text-sm md:text-base px-7 py-3.5 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-primary/30">
            Unisciti a Fogliolina
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};

/* ===== helpers & subcomponents ===== */

const uvLabel = (v: number) => (v < 3 ? "Basso" : v < 6 ? "Moderato" : v < 8 ? "Alto" : "Molto alto");
const smogLabel = (v: number) => (v < 25 ? "Pulita" : v < 50 ? "Discreta" : "Inquinata");
const pollenLabel = (v: number) => (v < 5 ? "Bassi" : v < 20 ? "Moderati" : "Alti");
const humidLabel = (v: number) => (v < 40 ? "Secca" : v < 65 ? "Confortevole" : "Umida");
const tempLabel = (v: number) => (v <= 5 ? "Freddo" : v < 18 ? "Fresco" : v < 26 ? "Mite" : "Caldo");
const windLabel = (v: number) => (v < 10 ? "Calmo" : v < 25 ? "Brezza" : "Forte");

const Metric = ({
  icon,
  label,
  value,
  hint,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  unit?: string;
}) => (
  <motion.div
    whileHover={{ y: -3 }}
    transition={{ type: "spring", stiffness: 220, damping: 16 }}
    className="rounded-2xl bg-background/80 backdrop-blur border border-border/60 p-4 md:p-5 shadow-sm"
  >
    <div className="flex items-center gap-1.5 text-primary text-[10px] font-body font-semibold uppercase tracking-[0.16em] mb-2">
      {icon}
      {label}
    </div>
    <div className="font-display text-2xl md:text-3xl font-bold leading-none tabular-nums">
      {value}
      {unit && <span className="text-xs font-body font-medium text-muted-foreground ml-1">{unit}</span>}
    </div>
    <div className="font-body text-[11px] text-muted-foreground mt-1.5">{hint}</div>
  </motion.div>
);

const ExperienceCard = ({
  icon,
  tag,
  title,
  text,
}: {
  icon: React.ReactNode;
  tag: string;
  title: string;
  text: string;
}) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ type: "spring", stiffness: 200, damping: 16 }}
    className="group rounded-[1.5rem] border border-border/60 bg-background/70 backdrop-blur-xl p-6 md:p-7 shadow-sm hover:border-primary/40 transition-colors"
  >
    <div className="flex items-center gap-2 text-primary mb-4">
      <span className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10">
        {icon}
      </span>
      <span className="font-body text-[10px] tracking-[0.22em] uppercase">{tag}</span>
    </div>
    <h4 className="font-display text-xl md:text-2xl font-semibold leading-tight">{title}</h4>
    <p className="font-body text-sm text-muted-foreground mt-2.5 leading-relaxed">{text}</p>
  </motion.div>
);

const Particles = ({ color }: { color: "violet" | "muted" | "sky" }) => {
  const dots = Array.from({ length: 14 });
  const cls =
    color === "violet"
      ? "bg-violet/70"
      : color === "sky"
      ? "bg-sky/70"
      : "bg-muted-foreground/40";
  return (
    <div className="pointer-events-none absolute inset-0 -z-0">
      {dots.map((_, i) => (
        <motion.span
          key={i}
          className={`absolute w-1.5 h-1.5 rounded-full ${cls}`}
          style={{
            left: `${10 + (i * 7) % 80}%`,
            top: `${15 + (i * 13) % 70}%`,
          }}
          animate={{
            y: [0, -14, 0],
            opacity: [0.2, 0.9, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3 + (i % 4),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
};

const SunRays = () => (
  <div className="pointer-events-none absolute -inset-10 -z-0">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 rounded-full"
      style={{
        background:
          "conic-gradient(from 0deg, transparent 0deg, hsl(var(--secondary)/0.18) 20deg, transparent 40deg, transparent 90deg, hsl(var(--secondary)/0.18) 110deg, transparent 130deg, transparent 180deg, hsl(var(--secondary)/0.18) 200deg, transparent 220deg, transparent 270deg, hsl(var(--secondary)/0.18) 290deg, transparent 310deg)",
        maskImage: "radial-gradient(circle, transparent 38%, black 60%)",
        WebkitMaskImage: "radial-gradient(circle, transparent 38%, black 60%)",
      }}
    />
  </div>
);

const Sparkle = () => (
  <div className="pointer-events-none absolute inset-0 -z-0">
    {[0, 1, 2, 3, 4].map((i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{
          left: `${15 + i * 18}%`,
          top: `${20 + (i % 2) * 50}%`,
        }}
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 1, 0],
          rotate: [0, 90, 180],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          delay: i * 0.6,
          ease: "easeInOut",
        }}
      >
        <Sparkles size={14} className="text-secondary" />
      </motion.div>
    ))}
  </div>
);

export default PlantGrowthApp;