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
  ArrowUpRight,
  Instagram,
  Linkedin,
  X,
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

type Hourly = {
  time: string[]; // ISO hour strings
  uv: number[];
  pm25: number[];
  pm10: number[];
  pollen: number[];
  humidity: number[];
  temp: number[];
  wind: number[];
  aqi: number[];
};

type MetricKey = "uv" | "pm25" | "pm10" | "pollen" | "humidity" | "temp" | "wind" | "aqi";

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

const aqiLabel = (n: number) => ["—", "Eccellente", "Buona", "Discreta", "Scarsa", "Critica"][n] ?? "—";

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

type Weather = "sunny" | "rainy" | "windy" | "snowy" | "default";
const weatherFromEnv = (env: Env | null): Weather => {
  if (!env) return "default";
  if (env.temp <= 2 || (env.temp <= 4 && env.rain >= 0.5)) return "snowy";
  if (env.rain >= 1) return "rainy";
  if (env.wind >= 25) return "windy";
  if (env.isDay) return "sunny";
  return "default";
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

type RecoStatus = "calm" | "watch" | "alert";
type Correlation = "low" | "moderate" | "high";
type Reco = {
  tag: string;
  title: string;
  insight: string;        // probabilistic statement about environment
  rationale: string;      // "Perché questo insight?" — scientific evidence
  protocol: string;       // cosmetic protocol (non-commercial)
  actives: string[];      // ingredient families / functional classes
  correlation: Correlation; // strength of environmental correlation
  status: RecoStatus;
  trigger?: string;       // environmental trigger label (e.g. "UV 7.2")
};

const buildRecos = (env: Env | null, phase: Phase): Reco[] => {
  if (!env)
    return [
      {
        tag: "Mantenimento",
        title: "Condizioni di equilibrio",
        insight:
          "I parametri ambientali non evidenziano stressori rilevanti: la routine può rimanere in modalità di mantenimento.",
        rationale:
          "In assenza di trigger ambientali significativi (UV, particolato, bassa umidità), la letteratura suggerisce di privilegiare gesti delicati per preservare l'omeostasi della barriera.",
        protocol:
          "Detersione delicata, idratazione leggera e supporto antiossidante quotidiano.",
        actives: ["Umettanti", "Antiossidanti soft", "Lenitivi"],
        correlation: "low",
        status: "calm",
      },
    ];
  const r: Reco[] = [];

  if (phase === "night") {
    r.push({
      tag: "Recupero notturno",
      title: "Fase circadiana riparativa",
      insight:
        "Le ore notturne possono favorire i processi di rigenerazione cutanea e il consolidamento della matrice dermica.",
      rationale:
        "Studi sul ritmo circadiano cutaneo (Matsui et al., 2016) mostrano un picco notturno di proliferazione dei cheratinociti e di sintesi di collagene, condizione favorevole all'uso di attivi rinnovanti.",
      protocol:
        "Routine serale focalizzata su rinnovamento cellulare e supporto della matrice extracellulare.",
      actives: ["Retinoidi cosmetici", "Peptidi biomimetici", "Emollienti occlusivi leggeri"],
      correlation: "moderate",
      status: "watch",
      trigger: "Fase notturna",
    });
    if (env.humidity < 45)
      r.push({
        tag: "Supporto barriera",
        title: "Condizioni favorevoli alla disidratazione",
        insight:
          "L'umidità relativa ridotta nelle ore notturne può favorire un aumento della perdita di acqua transepidermica (TEWL).",
        rationale:
          "A umidità inferiore al 45% la letteratura dermatologica (Engebretsen et al., 2016) descrive un incremento del TEWL e una riduzione transitoria dell'integrità dello strato corneo.",
        protocol:
          "Layering umettante seguito da una texture più ricca per supportare il film idrolipidico durante la notte.",
        actives: ["Umettanti polari", "Ceramidi", "Lipidi barriera"],
        correlation: "high",
        status: "alert",
        trigger: `Umidità ${env.humidity.toFixed(0)}%`,
      });
    else
      r.push({
        tag: "Comfort cutaneo",
        title: "Mantenimento dell'equilibrio sebo-idrico",
        insight:
          "Con umidità adeguata la pelle può beneficiare di gesti di riequilibrio leggeri, senza ricorrere a formule occlusive.",
        rationale:
          "Un'umidità ambientale fisiologica (45–65%) è associata in letteratura a un funzionamento ottimale degli enzimi della desquamazione e della sintesi lipidica.",
        protocol:
          "Maschera leggera riequilibrante, evitando attivi aggressivi e tensioattivi forti.",
        actives: ["Argille fini", "Niacinamide", "Prebiotici"],
        correlation: "low",
        status: "calm",
      });
    return r.slice(0, 4);
  }

  if (env.uv >= 6)
    r.push({
      tag: "Fotoprotezione",
      title: "Esposizione UV elevata",
      insight:
        "L'indice UV attuale può favorire un aumento dello stress ossidativo cutaneo e accelerare i meccanismi di photoaging.",
      rationale:
        "Per UV ≥ 6 la letteratura (ICNIRP, WHO) raccomanda fotoprotezione ad ampio spettro; antiossidanti topici sono studiati per ridurre il carico di specie reattive dell'ossigeno (ROS) UV-indotte.",
      protocol:
        "Fotoprotezione ad ampio spettro come gesto cardine, abbinata a un supporto antiossidante mattutino e a riapplicazione durante l'esposizione.",
      actives: ["Filtri UVA/UVB", "Vitamina C stabilizzata", "Vitamina E", "Polifenoli"],
      correlation: "high",
      status: "alert",
      trigger: `UV ${env.uv.toFixed(1)}`,
    });
  else
    r.push({
      tag: "Fotoprotezione",
      title: "Esposizione UV contenuta",
      insight:
        "L'indice UV attuale è moderato: la fotoprotezione resta consigliata come misura preventiva quotidiana.",
      rationale:
        "Anche a UV bassi, l'esposizione cumulativa è considerata un fattore rilevante nell'invecchiamento cutaneo cronico (chronic photoaging).",
      protocol:
        "Fotoprotezione leggera quotidiana su base antiossidante, come gesto di mantenimento.",
      actives: ["Filtri UVA/UVB", "Vitamina C", "Acido ferulico"],
      correlation: "moderate",
      status: "calm",
      trigger: `UV ${env.uv.toFixed(1)}`,
    });

  if (env.pm25 >= 15 || env.pm10 >= 40)
    r.push({
      tag: "Anti-pollution",
      title: "Carico di particolato urbano",
      insight:
        "I livelli attuali di particolato fine (PM2.5/PM10) possono favorire fenomeni di stress ossidativo e infiammazione cutanea di basso grado.",
      rationale:
        "L'esposizione cronica al particolato è associata in letteratura (Vierkötter et al., 2010) a iperpigmentazione, perdita di tono e accentuazione delle rughe; la frazione lipofila tende ad aderire al sebo cutaneo.",
      protocol:
        "Detersione accurata in due tempi a fine giornata e supporto antiossidante mirato contro lo stress ossidativo da exposome urbano.",
      actives: ["Detergenti lipofili delicati", "Polifenoli", "Resveratrolo", "Estratti upcycled"],
      correlation: "high",
      status: "alert",
      trigger: `PM2.5 ${env.pm25.toFixed(1)} µg/m³`,
    });

  if (env.humidity < 40)
    r.push({
      tag: "Supporto barriera",
      title: "Condizioni favorevoli alla disidratazione cutanea",
      insight:
        "Con umidità relativa inferiore al 40% può aumentare la perdita di acqua transepidermica e ridursi la sensazione di comfort cutaneo.",
      rationale:
        "In ambienti secchi lo strato corneo tende a perdere flessibilità; il supporto della barriera con lipidi fisiologici è documentato come strategia di ripristino del film idrolipidico.",
      protocol:
        "Sequenza umettante su pelle ancora umida, sigillata da una texture ricca di lipidi affini a quelli cutanei.",
      actives: ["Acido ialuronico a basso PM", "Ceramidi NP", "Colesterolo", "Acidi grassi essenziali"],
      correlation: "high",
      status: "watch",
      trigger: `Umidità ${env.humidity.toFixed(0)}%`,
    });
  else if (env.humidity > 75)
    r.push({
      tag: "Comfort cutaneo",
      title: "Umidità elevata",
      insight:
        "Con umidità ambientale alta, formule troppo occlusive possono amplificare la sensazione di pesantezza cutanea.",
      rationale:
        "In ambienti molto umidi la diffusione del vapore acqueo dalla pelle è ridotta: texture più leggere sono in genere meglio tollerate dal punto di vista sensoriale.",
      protocol:
        "Privilegiare texture acquose, gel-cream e sieri leggeri; ridurre i film occlusivi pesanti.",
      actives: ["Gel di acido ialuronico", "Niacinamide", "Estratti botanici leggeri"],
      correlation: "moderate",
      status: "calm",
      trigger: `Umidità ${env.humidity.toFixed(0)}%`,
    });

  if (env.wind >= 20 || env.temp <= 8)
    r.push({
      tag: "Stress meccanico-termico",
      title: env.wind >= 20 ? "Vento sostenuto" : "Temperatura bassa",
      insight:
        "Vento e basse temperature possono favorire il raffreddamento e la disidratazione superficiale, sollecitando la barriera cutanea.",
      rationale:
        "Il vento accelera l'evaporazione dell'acqua dalla superficie cutanea; il freddo riduce temporaneamente la fluidità dei lipidi intercorneocitari, condizione associata a sensazione di tensione e rossore.",
      protocol:
        "Texture confortevoli con lipidi affini a quelli cutanei e burri vegetali, applicate prima dell'esposizione.",
      actives: ["Ceramidi NP", "Burro di karité", "Squalano", "Oli vegetali ricchi in omega"],
      correlation: "moderate",
      status: "watch",
      trigger: env.wind >= 20 ? `Vento ${env.wind.toFixed(0)} km/h` : `Temp ${env.temp.toFixed(0)}°C`,
    });

  if (env.pollen >= 20)
    r.push({
      tag: "Sensibilità reattiva",
      title: "Carica pollinica elevata",
      insight:
        "Concentrazioni elevate di pollini possono favorire reattività cutanea, in particolare nelle pelli predisposte a sensibilità.",
      rationale:
        "Studi sull'esposoma (Krutmann et al., 2017) descrivono interazioni tra allergeni aerodispersi e barriera cutanea, con possibile attivazione di mediatori pro-infiammatori.",
      protocol:
        "Routine minimalista lenitiva: ridurre temporaneamente attivi potenzialmente irritanti (acidi forti, retinoidi ad alta concentrazione).",
      actives: ["Centella asiatica", "Bisabololo", "Allantoina", "Pantenolo"],
      correlation: "moderate",
      status: "alert",
      trigger: `Pollini ${env.pollen.toFixed(0)} gr/m³`,
    });

  return r.slice(0, 4);
};

/* ---------------- pollen formatting ---------------- */

const pollenSeverity = (v: number) => (v < 5 ? "Basso" : v < 20 ? "Moderato" : v < 50 ? "Alto" : "Molto alto");

const pollenExplain = (v: number) =>
  v < 5
    ? "Esposizione trascurabile, pelle non reattiva."
    : v < 20
      ? "Possibili microirritazioni in pelli sensibili."
      : "Probabili reazioni cutanee: prediligi texture leniscenti.";

/* ---------------- Skin Mood (biological state) ---------------- */

type SkinMoodKey =
  | "balanced"
  | "barrier"
  | "oxidative"
  | "repair"
  | "reactive"
  | "detox";

type SkinMoodInfo = {
  key: SkinMoodKey;
  label: string;
  subtitle: string;
  description: string;
  status: RecoStatus;
  metrics: { label: string; value: number /* 0-100 health */ }[];
};

const computeSkinMood = (env: Env | null, phase: Phase): SkinMoodInfo => {
  // Health metrics (0-100, higher = better)
  const oxidative = env
    ? Math.max(
        0,
        100 -
          (phase === "night" ? 0 : Math.min(env.uv, 11) * 7) -
          Math.min(env.pm25, 50) * 1.1,
      )
    : 78;
  const barrier = env
    ? Math.max(
        0,
        100 -
          (env.humidity < 40 ? (40 - env.humidity) * 1.6 : 0) -
          (env.wind > 15 ? (env.wind - 15) * 1.1 : 0) -
          (env.temp <= 5 ? (5 - env.temp) * 2 : 0),
      )
    : 80;
  const microbiome = env
    ? Math.max(
        0,
        100 -
          (env.pollen >= 20 ? Math.min(env.pollen - 20, 40) * 1.2 : 0) -
          (env.humidity > 80 ? (env.humidity - 80) * 1.5 : 0) -
          (env.pm10 > 40 ? (env.pm10 - 40) * 0.6 : 0),
      )
    : 82;

  const metrics = [
    { label: "Equilibrio ossidativo", value: Math.round(oxidative) },
    { label: "Integrità barriera", value: Math.round(barrier) },
    { label: "Armonia microbiota", value: Math.round(microbiome) },
  ];

  if (phase === "night")
    return {
      key: "repair",
      label: "Cellular Repair",
      subtitle: "Fase circadiana riparativa",
      description:
        "Il ciclo notturno favorisce sintesi di collagene, autofagia e turnover dei cheratinociti: la pelle riequilibra il TEWL e consolida la matrice dermica.",
      status: "calm",
      metrics,
    };
  if (oxidative < 55)
    return {
      key: "oxidative",
      label: "Oxidative Stress Risk",
      subtitle: "Carico radicalico elevato",
      description:
        "L'esposizione UV e il particolato fine generano specie reattive dell'ossigeno (ROS) che ossidano lipidi cutanei e collagene. Priorità a vitamina C, ferulico e polifenoli upcycled.",
      status: "alert",
      metrics,
    };
  if (barrier < 60)
    return {
      key: "barrier",
      label: "Barrier Recovery",
      subtitle: "Disturbo del film idrolipidico",
      description:
        "Bassa umidità e stress meccanico aumentano il TEWL e indeboliscono lo strato corneo. La barriera richiede ceramidi NP, colesterolo e acidi grassi per ricostituire il rapporto 3:1:1.",
      status: "watch",
      metrics,
    };
  if (microbiome < 65)
    return {
      key: "reactive",
      label: "Reactive Sensitivity",
      subtitle: "Microbiota perturbato",
      description:
        "Pollini e umidità sbilanciata alterano la diversità microbica, predisponendo a flushing e iperreattività. Lenitivi non-occlusivi e prebiotici favoriscono l'omeostasi.",
      status: "watch",
      metrics,
    };
  if (env && env.pm25 >= 15)
    return {
      key: "detox",
      label: "Detox Mode",
      subtitle: "Carica urbana sostenuta",
      description:
        "Il particolato lipofilo aderisce al sebo e penetra nei follicoli. Detersione bifasica e antiossidanti polifenolici neutralizzano i metaboliti pro-infiammatori.",
      status: "watch",
      metrics,
    };
  return {
    key: "balanced",
    label: "Balanced",
    subtitle: "Omeostasi cutanea ottimale",
    description:
      "I parametri ambientali sostengono un equilibrio tra idratazione, microbiota e difese antiossidanti. La routine entra in modalità mantenimento attivo.",
    status: "calm",
    metrics,
  };
};

/* deterministic mini sparkline series from a seed */
const sparkSeries = (seed: number, base: number) => {
  const out: number[] = [];
  let s = (seed * 9301 + 49297) % 233280;
  for (let i = 0; i < 14; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = (s / 233280 - 0.5) * 0.45;
    const drift = Math.sin((i / 13) * Math.PI) * 0.18;
    out.push(Math.max(0.05, Math.min(0.95, base + r + drift - 0.1)));
  }
  return out;
};

/* ---------------- page ---------------- */

const GrowSection = () => {
  const [env, setEnv] = useState<Env | null>(null);
  const [hourly, setHourly] = useState<Hourly | null>(null);
  const [openMetric, setOpenMetric] = useState<MetricKey | null>(null);
  const [openSun, setOpenSun] = useState(false);
  const [place, setPlace] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  const fetchAll = async (lat: number, lon: number, fallback = false, ipCity = "") => {
    setLoading(true);
    try {
      const meteo = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum,uv_index_max,sunrise,sunset&current=relative_humidity_2m,temperature_2m,apparent_temperature,wind_speed_10m,is_day,uv_index,precipitation,weather_code&hourly=uv_index,relative_humidity_2m,temperature_2m,wind_speed_10m,precipitation&timezone=auto&forecast_days=1&cell_selection=nearest`;
      const air = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,grass_pollen,birch_pollen,olive_pollen,alder_pollen,ragweed_pollen&hourly=pm10,pm2_5,grass_pollen,birch_pollen,olive_pollen,alder_pollen,ragweed_pollen&timezone=auto&forecast_days=1`;
      const geo = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=it`;

      const [m, a, g] = await Promise.all([
        fetch(meteo).then((r) => r.json()),
        fetch(air).then((r) => r.json()),
        fetch(geo)
          .then((r) => r.json())
          .catch(() => null),
      ]);

      const c = a?.current ?? {};
      const pollen = [c.grass_pollen, c.birch_pollen, c.olive_pollen, c.alder_pollen, c.ragweed_pollen]
        .filter((v) => typeof v === "number")
        .reduce((s: number, v: number) => s + v, 0);

      const pm10 = c.pm10 ?? 0;
      const pm25 = c.pm2_5 ?? 0;

      // Prefer current UV index (real-time) over daily max for precision
      const currentUv =
        typeof m?.current?.uv_index === "number"
          ? m.current.uv_index
          : m?.daily?.uv_index_max?.[0] ?? 0;
      // Prefer current precipitation (mm in last hour) over daily total
      const currentRain =
        typeof m?.current?.precipitation === "number"
          ? m.current.precipitation
          : m?.daily?.precipitation_sum?.[0] ?? 0;

      const next: Env = {
        uv: Math.max(0, currentUv),
        pm10,
        pm25,
        aqi: aqiFromPm(pm25, pm10),
        humidity: m?.current?.relative_humidity_2m ?? 50,
        pollen,
        wind: m?.current?.wind_speed_10m ?? 0,
        temp: m?.current?.temperature_2m ?? 18,
        rain: currentRain,
        isDay: !!m?.current?.is_day,
        sunrise: m?.daily?.sunrise?.[0] ?? new Date().toISOString(),
        sunset: m?.daily?.sunset?.[0] ?? new Date().toISOString(),
      };
      setEnv(next);

      // Hourly series (24h, today)
      const mh = m?.hourly ?? {};
      const ah = a?.hourly ?? {};
      const time: string[] = mh.time ?? ah.time ?? [];
      const len = time.length;
      const num = (arr: unknown): number[] =>
        Array.isArray(arr) ? (arr as unknown[]).map((v) => (typeof v === "number" ? v : 0)) : new Array(len).fill(0);
      const sumAt = (i: number, ...arrs: number[][]) =>
        arrs.reduce((s, a) => s + (a[i] ?? 0), 0);
      const grass = num(ah.grass_pollen);
      const birch = num(ah.birch_pollen);
      const olive = num(ah.olive_pollen);
      const alder = num(ah.alder_pollen);
      const ragweed = num(ah.ragweed_pollen);
      const pollenH = time.map((_, i) => sumAt(i, grass, birch, olive, alder, ragweed));
      const pm25H = num(ah.pm2_5);
      const pm10H = num(ah.pm10);
      setHourly({
        time,
        uv: num(mh.uv_index),
        humidity: num(mh.relative_humidity_2m),
        temp: num(mh.temperature_2m),
        wind: num(mh.wind_speed_10m),
        pm25: pm25H,
        pm10: pm10H,
        pollen: pollenH,
        aqi: time.map((_, i) => aqiFromPm(pm25H[i] ?? 0, pm10H[i] ?? 0)),
      });

      setCoords({ lat, lon });
      const city = g?.city || g?.locality;
      setPlace(
        city
          ? [city, g?.principalSubdivision].filter(Boolean).join(", ")
          : ipCity
            ? ipCity
            : fallback
              ? FALLBACK.label
              : "La tua posizione",
      );
      setUpdatedAt(new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
    } finally {
      setLoading(false);
    }
  };

  const requestLoc = () => {
    // 1) Render immediately with the fallback location so the UI is never blank.
    fetchAll(FALLBACK.lat, FALLBACK.lon, true);

    // 2) In parallel, try IP-based geolocation (no permission prompt) and
    //    refresh data if it returns a different coarse location.
    fetch("https://ipapi.co/json/")
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((d) => {
        if (!d?.latitude || !d?.longitude) return;
        const ipCity = d.city ? `${d.city}${d.region ? ", " + d.region : ""}` : "";
        fetchAll(d.latitude, d.longitude, false, ipCity);
      });

    // 3) Try precise browser geolocation; upgrade silently if granted.
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => fetchAll(p.coords.latitude, p.coords.longitude),
        () => {},
        { timeout: 4000, maximumAge: 600_000, enableHighAccuracy: false },
      );
    }
  };

  useEffect(() => {
    requestLoc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phase = useMemo(() => computePhase(env), [env]);
  const theme = PHASE_THEME[phase];
  const isNight = phase === "night";
  const mood = useMemo(() => moodFromEnv(env, phase), [env, phase]);
  const weather = useMemo(() => weatherFromEnv(env), [env]);
  const comfort = useMemo(() => computeComfort(env, phase), [env, phase]);
  const hydra = useMemo(() => hydrationRisk(env), [env]);
  const blue = useMemo(() => blueLightExposure(phase), [phase]);
  const recos = useMemo(() => buildRecos(env, phase), [env, phase]);
  const skinMood = useMemo(() => computeSkinMood(env, phase), [env, phase]);

  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

  const uvDisplay = isNight ? "0.0" : env ? env.uv.toFixed(1) : "—";
  const uvHint = isNight
    ? "Inattivo (notte)"
    : env
      ? env.uv < 3
        ? "Basso"
        : env.uv < 6
          ? "Moderato"
          : env.uv < 8
            ? "Alto"
            : "Molto alto"
      : "";

  return (
    <div
      id="grow"
      className="relative overflow-hidden transition-colors duration-700"
      style={{ background: theme.bg, color: theme.text }}
    >
      {/* ===== Ambient botanical gradient layer ===== */}
      <AmbientLayer phase={phase} env={env} />

      {/* ======= HERO HEADER ======= */}
      <header className="relative pt-20 md:pt-28 pb-10 md:pb-14">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <span className="text-[10px] tracking-[0.35em] uppercase font-body" style={{ color: theme.textMuted }}>
                Amarea · Skin Weather Dashboard
              </span>
              <h2 className="font-display text-4xl md:text-6xl leading-[1.05] mt-3" style={{ color: theme.text }}>
                Grow <span className="italic font-light">With Amarea</span>
              </h2>
              <div className="mt-4">
                <div
                  className="text-[10px] tracking-[0.35em] uppercase font-body mb-2"
                  style={{ color: theme.textMuted }}
                >
                  Follow us
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://www.instagram.com/amareacosmetics?igsh=ZWI1b3hiamNxczAx"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram Amarea Cosmetics"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full border backdrop-blur-md transition-colors hover:opacity-80"
                    style={{
                      borderColor: theme.border,
                      color: theme.text,
                      background: isNight ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.55)",
                    }}
                  >
                    <Instagram size={15} />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/amareacosmetics/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn Amarea Cosmetics"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full border backdrop-blur-md transition-colors hover:opacity-80"
                    style={{
                      borderColor: theme.border,
                      color: theme.text,
                      background: isNight ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.55)",
                    }}
                  >
                    <Linkedin size={15} />
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4 font-body text-sm flex-wrap" style={{ color: theme.textMuted }}>
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
                <div className="font-display text-sm" style={{ color: theme.text }}>
                  {theme.eyebrow}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ======= PRIMARY ROW: Comfort score + Assistant + Quick stats ======= */}
      <section className="relative pb-12">
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
                    <div className="font-body text-sm" style={{ color: theme.textMuted }}>
                      / 100
                    </div>
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
                  <Fogliolina mood={mood} weather={weather} size={170} />
                </div>
              </div>

              {/* Sub-row: 3 derived insights */}
              <div
                className="grid grid-cols-3 gap-px mt-8 rounded-2xl overflow-hidden"
                style={{ background: theme.border }}
              >
                <SubInsight
                  theme={theme}
                  icon={<Droplets size={14} />}
                  label="Hydration risk"
                  value={hydra.level}
                  note={hydra.note}
                />
                <SubInsight
                  theme={theme}
                  icon={<Monitor size={14} />}
                  label="Blue light"
                  value={blue.level}
                  note={blue.note}
                />
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
            <button
              type="button"
              onClick={() => setOpenSun(true)}
              className="text-left w-full rounded-[28px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 transition-transform hover:-translate-y-[2px]"
              aria-label="Apri andamento ciclo solare"
            >
            <GlassCard theme={theme}>
              <Eyebrow theme={theme}>Ciclo solare</Eyebrow>
              <div className="mt-5 flex items-center justify-between">
                <SunPoint
                  theme={theme}
                  icon={<Sunrise size={18} />}
                  label="Alba"
                  value={env ? fmtTime(env.sunrise) : "—"}
                />
                <SunArc phase={phase} theme={theme} />
                <SunPoint
                  theme={theme}
                  icon={<Sunset size={18} />}
                  label="Tramonto"
                  value={env ? fmtTime(env.sunset) : "—"}
                />
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
            </button>
          </div>
        </div>
      </section>

      {/* ======= ENVIRONMENTAL DASHBOARD GRID ======= */}
      <section className="relative pb-12">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-6">
            <Eyebrow theme={theme}>Indicatori ambientali</Eyebrow>
            <span className="font-body text-[10px] tracking-[0.25em] uppercase" style={{ color: theme.textMuted }}>
              Real-time · Open-Meteo
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            <Metric
              theme={theme}
              icon={<Sun size={16} />}
              label="UV Index"
              value={uvDisplay}
              unit="UVI"
              hint={uvHint}
              series={sparkSeries(1, isNight ? 0.1 : Math.min(1, (env?.uv ?? 0) / 11))}
              accent="#E2B670"
              dim={isNight}
              onClick={() => setOpenMetric("uv")}
            />
            <Metric
              theme={theme}
              icon={<CloudFog size={16} />}
              label="PM2.5"
              value={env ? env.pm25.toFixed(1) : "—"}
              unit="µg/m³"
              hint={env ? (env.pm25 < 10 ? "OMS: nei limiti" : env.pm25 < 25 ? "Sopra OMS" : "Critico") : ""}
              series={sparkSeries(2, Math.min(1, (env?.pm25 ?? 0) / 50))}
              accent="#B8A89A"
              onClick={() => setOpenMetric("pm25")}
            />
            <Metric
              theme={theme}
              icon={<CloudFog size={16} />}
              label="PM10"
              value={env ? env.pm10.toFixed(0) : "—"}
              unit="µg/m³"
              hint={env ? (env.pm10 < 25 ? "Aria pulita" : env.pm10 < 50 ? "Discreta" : "Carica") : ""}
              series={sparkSeries(3, Math.min(1, (env?.pm10 ?? 0) / 100))}
              accent="#A89C8E"
              onClick={() => setOpenMetric("pm10")}
            />
            <Metric
              theme={theme}
              icon={<Flower2 size={16} />}
              label="Pollen"
              value={env ? env.pollen.toFixed(1) : "—"}
              unit="grains/m³"
              hint={env ? `${pollenSeverity(env.pollen)} · ${pollenExplain(env.pollen)}` : ""}
              series={sparkSeries(4, Math.min(1, (env?.pollen ?? 0) / 60))}
              accent="#C9A877"
              wide
              onClick={() => setOpenMetric("pollen")}
            />
            <Metric
              theme={theme}
              icon={<Droplets size={16} />}
              label="Humidity"
              value={env ? env.humidity.toFixed(0) : "—"}
              unit="%"
              hint={env ? (env.humidity < 40 ? "Aria secca" : env.humidity < 70 ? "Equilibrata" : "Umida") : ""}
              series={sparkSeries(5, Math.min(1, (env?.humidity ?? 50) / 100))}
              accent="#96C2C8"
              onClick={() => setOpenMetric("humidity")}
            />
            <Metric
              theme={theme}
              icon={<Thermometer size={16} />}
              label="Temperature"
              value={env ? env.temp.toFixed(0) : "—"}
              unit="°C"
              hint={
                env ? (env.temp < 10 ? "Fresco" : env.temp < 22 ? "Mite" : env.temp < 30 ? "Caldo" : "Torrido") : ""
              }
              series={sparkSeries(6, Math.min(1, Math.max(0, ((env?.temp ?? 18) + 5) / 45)))}
              accent="#D69478"
              onClick={() => setOpenMetric("temp")}
            />
            <Metric
              theme={theme}
              icon={<Wind size={16} />}
              label="Wind"
              value={env ? env.wind.toFixed(0) : "—"}
              unit="km/h"
              hint={env ? (env.wind < 10 ? "Calmo" : env.wind < 25 ? "Brezza" : "Forte") : ""}
              series={sparkSeries(7, Math.min(1, (env?.wind ?? 0) / 60))}
              accent="#A8B89A"
              onClick={() => setOpenMetric("wind")}
            />
            <Metric
              theme={theme}
              icon={<Activity size={16} />}
              label="Air Quality"
              value={env ? `${env.aqi}/5` : "—"}
              unit={env ? aqiLabel(env.aqi) : ""}
              hint="Indice EU PM2.5/PM10"
              series={sparkSeries(8, Math.min(1, (env?.aqi ?? 1) / 5))}
              accent="#B5A0C2"
              onClick={() => setOpenMetric("aqi")}
            />
          </div>
        </div>
      </section>

      {/* ===== METRIC DETAIL POPUP ===== */}
      <MetricDetailDialog
        metric={openMetric}
        hourly={hourly}
        theme={theme}
        onClose={() => setOpenMetric(null)}
      />

      {/* ===== SUN CYCLE POPUP ===== */}
      <SunCycleDialog
        open={openSun}
        env={env}
        hourly={hourly}
        theme={theme}
        onClose={() => setOpenSun(false)}
      />

      {/* ======= SMART RECOMMENDATIONS ======= */}
      <section className="relative pb-16 md:pb-24">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <Eyebrow theme={theme}>Environmental skin insights</Eyebrow>
              <h2 className="font-display text-2xl md:text-4xl mt-2" style={{ color: theme.text }}>
                {isNight ? "Insight notturni per la pelle" : "Insight ambientali per la tua pelle"}
              </h2>
            </div>
            <span
              className="font-body text-[10px] tracking-[0.25em] uppercase hidden md:inline"
              style={{ color: theme.textMuted }}
            >
              {recos.length} insight scientifici
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
            <AnimatePresence mode="popLayout">
              {recos.map((r, i) => (
                <RecoCard key={r.title} reco={r} theme={theme} isNight={isNight} index={i} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

    </div>
  );
};

/* ---------------- atoms ---------------- */

const Eyebrow = ({ children, theme }: { children: React.ReactNode; theme: (typeof PHASE_THEME)["day"] }) => (
  <span className="text-[10px] tracking-[0.3em] uppercase font-body" style={{ color: theme.textMuted }}>
    {children}
  </span>
);

const GlassCard = ({ children, theme }: { children: React.ReactNode; theme: (typeof PHASE_THEME)["day"] }) => {
  const isNight = theme.label === "Notte";
  return (
    <div
      className="relative rounded-[28px] border backdrop-blur-2xl p-7 md:p-9 overflow-hidden"
      style={{
        background: isNight
          ? "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)"
          : "linear-gradient(160deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 100%)",
        borderColor: isNight ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.7)",
        boxShadow: isNight
          ? "0 30px 80px -40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 30px 60px -40px rgba(31,37,32,0.22), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      {/* botanical sheen */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-20 h-60 w-60 rounded-full opacity-40 blur-3xl"
        style={{
          background: isNight
            ? "radial-gradient(circle, rgba(201,184,217,0.35), transparent 70%)"
            : "radial-gradient(circle, rgba(232,196,140,0.55), transparent 70%)",
        }}
      />
      <div className="relative">{children}</div>
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
  theme: (typeof PHASE_THEME)["day"];
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) => {
  const isNight = theme.label === "Notte";
  return (
    <div
      className="p-5 flex flex-col h-full"
      style={{ background: isNight ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)" }}
    >
      <div className="flex items-center gap-1.5 h-5" style={{ color: theme.textMuted }}>
        {icon}
        <span className="text-[9px] tracking-[0.3em] uppercase font-body">{label}</span>
      </div>
      <div
        className="font-display text-base md:text-lg mt-2 min-h-7 leading-tight truncate"
        style={{ color: theme.text }}
        title={value}
      >
        {value}
      </div>
      <div className="font-body text-[11px] mt-1 leading-snug" style={{ color: theme.textMuted }}>
        {note}
      </div>
    </div>
  );
};

/* ---------------- Premium scientific recommendation card ---------------- */

const STATUS_TOKEN: Record<RecoStatus, { dot: string; ring: string; label: string }> = {
  calm:  { dot: "rgba(168,184,154,0.95)", ring: "rgba(168,184,154,0.30)", label: "Mantenimento" },
  watch: { dot: "rgba(214,178,120,0.95)", ring: "rgba(214,178,120,0.30)", label: "Adattamento" },
  alert: { dot: "rgba(201,128,108,0.95)", ring: "rgba(201,128,108,0.30)", label: "Priorità" },
};

const RecoCard = ({
  reco,
  theme,
  isNight,
  index,
}: {
  reco: Reco;
  theme: (typeof PHASE_THEME)["day"];
  isNight: boolean;
  index: number;
}) => {
  const tok = STATUS_TOKEN[reco.status];
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group relative rounded-[22px] p-6 border backdrop-blur-xl overflow-hidden flex flex-col"
      style={{
        background: isNight
          ? "linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)"
          : "linear-gradient(160deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.5) 100%)",
        borderColor: isNight ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.7)",
        boxShadow: isNight
          ? "0 20px 50px -30px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)"
          : "0 20px 40px -28px rgba(31,37,32,0.18), inset 0 1px 0 rgba(255,255,255,0.85)",
      }}
    >
      {/* status accent corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full blur-2xl opacity-50"
        style={{ background: `radial-gradient(circle, ${tok.ring}, transparent 70%)` }}
      />

      {/* header: status dot + tag + metric */}
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <motion.span
              className="absolute inline-flex h-full w-full rounded-full"
              style={{ background: tok.dot }}
              animate={{ scale: [1, 2.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ background: tok.dot }}
            />
          </span>
          <span
            className="text-[9px] tracking-[0.3em] uppercase font-body"
            style={{ color: theme.textMuted }}
          >
            {reco.tag}
          </span>
        </div>
        {reco.trigger && (
          <span
            className="font-body text-[10px] tracking-wide px-2 py-0.5 rounded-full border"
            style={{
              color: theme.textMuted,
              borderColor: theme.border,
              background: isNight ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.65)",
            }}
          >
            {reco.trigger}
          </span>
        )}
      </div>

      {/* title */}
      <h3
        className="relative font-display text-xl mt-4 leading-snug"
        style={{ color: theme.text }}
      >
        {reco.title}
      </h3>

      {/* probabilistic insight */}
      <p
        className="relative font-body text-[13px] mt-2.5 leading-relaxed"
        style={{ color: theme.textMuted }}
      >
        {reco.insight}
      </p>

      {/* hairline */}
      <div
        className="relative my-5 h-px"
        style={{ background: isNight ? "rgba(255,255,255,0.08)" : "rgba(31,37,32,0.08)" }}
      />

      {/* "Perché questo insight?" — scientific rationale */}
      <div
        className="relative rounded-xl p-3.5 border"
        style={{
          borderColor: isNight ? "rgba(255,255,255,0.07)" : "rgba(31,37,32,0.07)",
          background: isNight ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.55)",
        }}
      >
        <div
          className="text-[9px] tracking-[0.28em] uppercase font-body mb-1.5 flex items-center gap-1.5"
          style={{ color: theme.textMuted }}
        >
          <Sparkles className="w-2.5 h-2.5" strokeWidth={1.5} />
          Perché questo insight
        </div>
        <p
          className="font-body text-[12px] leading-relaxed italic"
          style={{ color: theme.textMuted }}
        >
          {reco.rationale}
        </p>
      </div>

      {/* protocol */}
      <div className="relative mt-4">
        <div
          className="text-[9px] tracking-[0.28em] uppercase font-body mb-1.5"
          style={{ color: theme.textMuted }}
        >
          Protocollo cosmetico
        </div>
        <p
          className="font-body text-[12.5px] leading-relaxed"
          style={{ color: theme.text }}
        >
          {reco.protocol}
        </p>
      </div>

      {/* hairline */}
      <div
        className="relative my-4 h-px"
        style={{ background: isNight ? "rgba(255,255,255,0.08)" : "rgba(31,37,32,0.08)" }}
      />

      {/* active ingredient families */}
      <div className="relative">
        <div
          className="text-[9px] tracking-[0.28em] uppercase font-body mb-2"
          style={{ color: theme.textMuted }}
        >
          Famiglie di attivi
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(reco.actives ?? []).map((ing) => (
            <span
              key={ing}
              className="font-body text-[11px] px-2.5 py-1 rounded-full border"
              style={{
                color: theme.text,
                borderColor: isNight ? "rgba(255,255,255,0.12)" : "rgba(31,37,32,0.10)",
                background: isNight ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
              }}
            >
              {ing}
            </span>
          ))}
        </div>
      </div>

      {/* environmental correlation indicator (qualitative, not biological %) */}
      <div className="relative mt-5 mt-auto pt-5">
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="text-[9px] tracking-[0.28em] uppercase font-body"
            style={{ color: theme.textMuted }}
          >
            Correlazione ambientale
          </span>
          <span
            className="font-body text-[10px] tracking-[0.18em] uppercase"
            style={{ color: theme.textMuted }}
          >
            {reco.correlation === "high"
              ? "Forte"
              : reco.correlation === "moderate"
                ? "Moderata"
                : "Debole"}
          </span>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => {
            const active =
              (reco.correlation === "high" && i < 3) ||
              (reco.correlation === "moderate" && i < 2) ||
              (reco.correlation === "low" && i < 1);
            return (
              <motion.div
                key={i}
                className="h-[3px] flex-1 rounded-full"
                initial={{ opacity: 0.2, scaleX: 0.6 }}
                animate={{ opacity: active ? 1 : 0.18, scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.07 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background: active
                    ? `linear-gradient(90deg, ${tok.dot}, ${tok.ring})`
                    : isNight
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(31,37,32,0.08)",
                  transformOrigin: "left",
                }}
              />
            );
          })}
        </div>
        <div
          className="mt-2 font-body text-[10px] tracking-wide"
          style={{ color: theme.textMuted }}
        >
          Modalità: {tok.label}
        </div>
      </div>
    </motion.article>
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
  series,
  accent,
  onClick,
}: {
  theme: (typeof PHASE_THEME)["day"];
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  hint: string;
  wide?: boolean;
  dim?: boolean;
  series?: number[];
  accent?: string;
  onClick?: () => void;
}) => {
  const isNight = theme.label === "Notte";
  const stroke = accent ?? theme.accent;
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`group relative rounded-[22px] border backdrop-blur-xl p-5 md:p-6 overflow-hidden flex flex-col ${
        onClick ? "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0" : ""
      } ${
        wide ? "md:col-span-2" : ""
      }`}
      style={{
        background: isNight
          ? "linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)"
          : "linear-gradient(160deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.55) 100%)",
        borderColor: isNight ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.7)",
        boxShadow: isNight
          ? "0 18px 40px -28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)"
          : "0 18px 36px -28px rgba(31,37,32,0.18), inset 0 1px 0 rgba(255,255,255,0.85)",
        opacity: dim ? 0.6 : 1,
      }}
    >
      {/* hover glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-10 h-32 w-32 rounded-full blur-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"
        style={{ background: `radial-gradient(circle, ${stroke}55, transparent 70%)` }}
      />

      <div className="relative flex items-center gap-1.5" style={{ color: theme.textMuted }}>
        <span style={{ color: stroke }}>{icon}</span>
        <span className="text-[9px] tracking-[0.32em] uppercase font-body">{label}</span>
      </div>

      <div className="relative flex flex-wrap items-end justify-between gap-x-3 gap-y-2 mt-4">
        <div className="flex items-baseline gap-1.5 min-w-0 flex-shrink">
          <span
            className="font-display text-[28px] sm:text-[32px] md:text-[40px] leading-none tracking-tight truncate"
            style={{ color: theme.text }}
          >
            {value}
          </span>
          <span
            className="font-body text-[10px] tracking-[0.18em] uppercase"
            style={{ color: theme.textMuted }}
          >
            {unit}
          </span>
        </div>
        {series && series.length > 1 && (
          <Sparkline series={series} stroke={stroke} dim={dim} />
        )}
      </div>

      <div
        className="relative font-body text-[11px] mt-3 leading-snug"
        style={{ color: theme.textMuted }}
      >
        {hint}
      </div>
    </motion.div>
  );
};

/* ---------------- metric detail dialog ---------------- */

const METRIC_META: Record<
  MetricKey,
  { label: string; unit: string; accent: string; fmt: (n: number) => string; hint: (n: number) => string }
> = {
  uv: {
    label: "UV Index",
    unit: "UVI",
    accent: "#E2B670",
    fmt: (n) => n.toFixed(1),
    hint: (n) => (n < 3 ? "Basso" : n < 6 ? "Moderato" : n < 8 ? "Alto" : "Molto alto"),
  },
  pm25: {
    label: "PM2.5",
    unit: "µg/m³",
    accent: "#B8A89A",
    fmt: (n) => n.toFixed(1),
    hint: (n) => (n < 10 ? "Nei limiti OMS" : n < 25 ? "Sopra OMS" : "Critico"),
  },
  pm10: {
    label: "PM10",
    unit: "µg/m³",
    accent: "#A89C8E",
    fmt: (n) => n.toFixed(0),
    hint: (n) => (n < 25 ? "Aria pulita" : n < 50 ? "Discreta" : "Carica"),
  },
  pollen: {
    label: "Pollini",
    unit: "grains/m³",
    accent: "#C9A877",
    fmt: (n) => n.toFixed(1),
    hint: (n) => pollenSeverity(n),
  },
  humidity: {
    label: "Umidità",
    unit: "%",
    accent: "#96C2C8",
    fmt: (n) => n.toFixed(0),
    hint: (n) => (n < 40 ? "Aria secca" : n < 70 ? "Equilibrata" : "Umida"),
  },
  temp: {
    label: "Temperatura",
    unit: "°C",
    accent: "#D69478",
    fmt: (n) => n.toFixed(0),
    hint: (n) => (n < 10 ? "Fresco" : n < 22 ? "Mite" : n < 30 ? "Caldo" : "Torrido"),
  },
  wind: {
    label: "Vento",
    unit: "km/h",
    accent: "#A8B89A",
    fmt: (n) => n.toFixed(0),
    hint: (n) => (n < 10 ? "Calmo" : n < 25 ? "Brezza" : "Forte"),
  },
  aqi: {
    label: "Qualità dell'aria",
    unit: "",
    accent: "#B5A0C2",
    fmt: (n) => `${Math.round(n)}/5`,
    hint: (n) => aqiLabel(Math.round(n)),
  },
};

const MetricDetailDialog = ({
  metric,
  hourly,
  theme,
  onClose,
}: {
  metric: MetricKey | null;
  hourly: Hourly | null;
  theme: (typeof PHASE_THEME)["day"];
  onClose: () => void;
}) => {
  const isNight = theme.label === "Notte";
  return (
    <AnimatePresence>
      {metric && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* backdrop */}
          <motion.div
            className="absolute inset-0 backdrop-blur-md"
            style={{ background: isNight ? "rgba(8,10,18,0.65)" : "rgba(20,22,28,0.45)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="relative w-full max-w-[640px] rounded-[28px] border backdrop-blur-2xl p-6 md:p-8 max-h-[85vh] overflow-y-auto"
            style={{
              background: isNight
                ? "linear-gradient(160deg, rgba(28,30,40,0.92) 0%, rgba(18,20,28,0.92) 100%)"
                : "linear-gradient(160deg, rgba(255,255,255,0.96) 0%, rgba(248,246,242,0.92) 100%)",
              borderColor: isNight ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.7)",
              color: theme.text,
              boxShadow: isNight
                ? "0 30px 80px -30px rgba(0,0,0,0.7)"
                : "0 30px 80px -30px rgba(31,37,32,0.3)",
            }}
          >
            <button
              onClick={onClose}
              aria-label="Chiudi"
              className="absolute top-4 right-4 inline-flex items-center justify-center w-9 h-9 rounded-full border transition-colors hover:opacity-80"
              style={{ borderColor: theme.border, color: theme.text }}
            >
              <X size={16} />
            </button>

            {(() => {
              const meta = METRIC_META[metric];
              const series = hourly?.[metric] ?? [];
              const times = hourly?.time ?? [];
              return (
                <>
                  <div className="text-[10px] tracking-[0.35em] uppercase font-body" style={{ color: theme.textMuted }}>
                    Andamento giornaliero · 24h
                  </div>
                  <h3
                    className="font-display text-3xl md:text-4xl mt-2"
                    style={{ color: theme.text }}
                  >
                    {meta.label}
                  </h3>
                  {series.length > 0 ? (
                    <HourlyChart
                      values={series}
                      times={times}
                      stroke={meta.accent}
                      unit={meta.unit}
                      fmt={meta.fmt}
                      theme={theme}
                    />
                  ) : (
                    <div
                      className="mt-8 font-body text-sm"
                      style={{ color: theme.textMuted }}
                    >
                      Dati orari non ancora disponibili.
                    </div>
                  )}

                  {series.length > 0 && (
                    <div
                      className="mt-6 grid grid-cols-3 gap-3 font-body text-xs"
                      style={{ color: theme.textMuted }}
                    >
                      <DialogStat
                        label="Min"
                        value={`${meta.fmt(Math.min(...series))} ${meta.unit}`}
                        theme={theme}
                      />
                      <DialogStat
                        label="Media"
                        value={`${meta.fmt(series.reduce((s, v) => s + v, 0) / series.length)} ${meta.unit}`}
                        theme={theme}
                      />
                      <DialogStat
                        label="Max"
                        value={`${meta.fmt(Math.max(...series))} ${meta.unit}`}
                        theme={theme}
                      />
                    </div>
                  )}
                </>
              );
            })()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DialogStat = ({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: (typeof PHASE_THEME)["day"];
}) => {
  const isNight = theme.label === "Notte";
  return (
    <div
      className="rounded-2xl border p-3"
      style={{
        borderColor: isNight ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        background: isNight ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.5)",
      }}
    >
      <div className="text-[9px] tracking-[0.28em] uppercase" style={{ color: theme.textMuted }}>
        {label}
      </div>
      <div className="font-display text-base mt-1" style={{ color: theme.text }}>
        {value}
      </div>
    </div>
  );
};

const HourlyChart = ({
  values,
  times,
  stroke,
  unit,
  fmt,
  theme,
}: {
  values: number[];
  times: string[];
  stroke: string;
  unit: string;
  fmt: (n: number) => string;
  theme: (typeof PHASE_THEME)["day"];
}) => {
  const w = 600;
  const h = 200;
  const pad = { l: 8, r: 8, t: 16, b: 24 };
  const max = Math.max(...values, 0.0001);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const step = innerW / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => {
    const x = pad.l + i * step;
    const y = pad.t + innerH - ((v - min) / range) * innerH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const d = `M${pts.join(" L")}`;
  const area = `${d} L${pad.l + innerW},${pad.t + innerH} L${pad.l},${pad.t + innerH} Z`;
  const nowH = new Date().getHours();
  const nowIdx = times.findIndex((t) => new Date(t).getHours() === nowH);
  const nowPt = nowIdx >= 0 ? pts[nowIdx]?.split(",") : null;
  const id = `hc-${stroke.replace(/[^a-z0-9]/gi, "")}`;
  const ticks = [0, 6, 12, 18, 23].filter((i) => i < times.length);
  return (
    <div className="mt-6">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.45" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${id})`} />
        <motion.path
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
        {nowPt && (
          <>
            <line
              x1={nowPt[0]}
              y1={pad.t}
              x2={nowPt[0]}
              y2={pad.t + innerH}
              stroke={theme.textMuted}
              strokeWidth="0.8"
              strokeDasharray="3 3"
              opacity="0.5"
            />
            <circle cx={nowPt[0]} cy={nowPt[1]} r="4" fill={stroke} />
          </>
        )}
        {ticks.map((i) => {
          const x = pad.l + i * step;
          const t = times[i] ? new Date(times[i]) : null;
          return (
            <text
              key={i}
              x={x}
              y={h - 6}
              fontSize="10"
              textAnchor="middle"
              fill={theme.textMuted}
              style={{ fontFamily: "inherit" }}
            >
              {t ? `${String(t.getHours()).padStart(2, "0")}:00` : ""}
            </text>
          );
        })}
      </svg>
      {nowIdx >= 0 && (
        <div className="font-body text-xs mt-3" style={{ color: theme.textMuted }}>
          Ora attuale: <span style={{ color: theme.text }}>{fmt(values[nowIdx])} {unit}</span>
        </div>
      )}
    </div>
  );
};

/* ---------------- sun cycle dialog ---------------- */

const SunCycleDialog = ({
  open,
  env,
  hourly,
  theme,
  onClose,
}: {
  open: boolean;
  env: Env | null;
  hourly: Hourly | null;
  theme: (typeof PHASE_THEME)["day"];
  onClose: () => void;
}) => {
  const isNight = theme.label === "Notte";
  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

  const sunriseDate = env ? new Date(env.sunrise) : null;
  const sunsetDate = env ? new Date(env.sunset) : null;
  const dayMinutes =
    sunriseDate && sunsetDate
      ? Math.max(0, (sunsetDate.getTime() - sunriseDate.getTime()) / 60000)
      : 0;
  const dayHours = Math.floor(dayMinutes / 60);
  const dayMins = Math.round(dayMinutes % 60);
  const noonDate =
    sunriseDate && sunsetDate
      ? new Date((sunriseDate.getTime() + sunsetDate.getTime()) / 2)
      : null;

  const now = new Date();
  const minutesIntoDay = now.getHours() * 60 + now.getMinutes();
  const sunriseMin = sunriseDate ? sunriseDate.getHours() * 60 + sunriseDate.getMinutes() : 360;
  const sunsetMin = sunsetDate ? sunsetDate.getHours() * 60 + sunsetDate.getMinutes() : 1200;
  const dawnStart = Math.max(0, sunriseMin - 30);
  const dawnEnd = sunriseMin + 30;
  const sunsetStart = sunsetMin - 30;
  const sunsetEnd = Math.min(1440, sunsetMin + 30);

  const totalMin = 1440;
  const pct = (m: number) => `${(m / totalMin) * 100}%`;

  const uvSeries = hourly?.uv ?? [];
  const peakUvIdx = uvSeries.length
    ? uvSeries.reduce((maxI, v, i, a) => (v > a[maxI] ? i : maxI), 0)
    : -1;
  const peakUvHour = peakUvIdx >= 0 && hourly?.time?.[peakUvIdx]
    ? new Date(hourly.time[peakUvIdx]).getHours()
    : null;
  const peakUv = peakUvIdx >= 0 ? uvSeries[peakUvIdx] : null;

  return (
    <AnimatePresence>
      {open && env && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="absolute inset-0 backdrop-blur-md"
            style={{ background: isNight ? "rgba(8,10,18,0.65)" : "rgba(20,22,28,0.45)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="relative w-full max-w-[640px] rounded-[28px] border backdrop-blur-2xl p-6 md:p-8 max-h-[85vh] overflow-y-auto"
            style={{
              background: isNight
                ? "linear-gradient(160deg, rgba(28,30,40,0.92) 0%, rgba(18,20,28,0.92) 100%)"
                : "linear-gradient(160deg, rgba(255,255,255,0.96) 0%, rgba(248,246,242,0.92) 100%)",
              borderColor: isNight ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.7)",
              color: theme.text,
              boxShadow: isNight
                ? "0 30px 80px -30px rgba(0,0,0,0.7)"
                : "0 30px 80px -30px rgba(31,37,32,0.3)",
            }}
          >
            <button
              onClick={onClose}
              aria-label="Chiudi"
              className="absolute top-4 right-4 inline-flex items-center justify-center w-9 h-9 rounded-full border transition-colors hover:opacity-80"
              style={{ borderColor: theme.border, color: theme.text }}
            >
              <X size={16} />
            </button>

            <div className="text-[10px] tracking-[0.35em] uppercase font-body" style={{ color: theme.textMuted }}>
              Andamento giornaliero · 24h
            </div>
            <h3 className="font-display text-3xl md:text-4xl mt-2" style={{ color: theme.text }}>
              Ciclo solare
            </h3>

            {/* 24h timeline bar with phases */}
            <div className="mt-8">
              <div
                className="relative h-12 rounded-full overflow-hidden border"
                style={{
                  borderColor: theme.border,
                  background: isNight ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                }}
              >
                {/* night before sunrise */}
                <div
                  className="absolute top-0 bottom-0"
                  style={{
                    left: 0,
                    width: pct(dawnStart),
                    background: "linear-gradient(90deg, #1a1f2e 0%, #2a2f44 100%)",
                  }}
                />
                {/* dawn */}
                <div
                  className="absolute top-0 bottom-0"
                  style={{
                    left: pct(dawnStart),
                    width: pct(dawnEnd - dawnStart),
                    background: "linear-gradient(90deg, #2a2f44 0%, #E2B670 100%)",
                  }}
                />
                {/* day */}
                <div
                  className="absolute top-0 bottom-0"
                  style={{
                    left: pct(dawnEnd),
                    width: pct(sunsetStart - dawnEnd),
                    background: "linear-gradient(90deg, #E2B670 0%, #F2D08A 50%, #E2B670 100%)",
                  }}
                />
                {/* sunset */}
                <div
                  className="absolute top-0 bottom-0"
                  style={{
                    left: pct(sunsetStart),
                    width: pct(sunsetEnd - sunsetStart),
                    background: "linear-gradient(90deg, #E2B670 0%, #6b3a44 100%)",
                  }}
                />
                {/* night after sunset */}
                <div
                  className="absolute top-0 bottom-0"
                  style={{
                    left: pct(sunsetEnd),
                    width: pct(totalMin - sunsetEnd),
                    background: "linear-gradient(90deg, #6b3a44 0%, #1a1f2e 100%)",
                  }}
                />

                {/* now marker */}
                <div
                  className="absolute top-0 bottom-0 w-[2px]"
                  style={{ left: pct(minutesIntoDay), background: "#ffffff", boxShadow: "0 0 8px rgba(255,255,255,0.8)" }}
                />
              </div>

              {/* hour ticks */}
              <div className="relative mt-2 h-4">
                {[0, 6, 12, 18, 24].map((h) => (
                  <div
                    key={h}
                    className="absolute -translate-x-1/2 text-[10px] font-body"
                    style={{ left: `${(h / 24) * 100}%`, color: theme.textMuted }}
                  >
                    {String(h).padStart(2, "0")}:00
                  </div>
                ))}
              </div>
            </div>

            {/* Stats grid */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <DialogStat label="Alba" value={fmtTime(env.sunrise)} theme={theme} />
              <DialogStat label="Tramonto" value={fmtTime(env.sunset)} theme={theme} />
              <DialogStat
                label="Mezzogiorno"
                value={noonDate ? fmtTime(noonDate.toISOString()) : "—"}
                theme={theme}
              />
              <DialogStat
                label="Durata giorno"
                value={dayMinutes > 0 ? `${dayHours}h ${dayMins}m` : "—"}
                theme={theme}
              />
            </div>

            {peakUvHour !== null && peakUv !== null && (
              <div
                className="mt-6 rounded-2xl border p-4 font-body text-sm leading-relaxed"
                style={{
                  borderColor: isNight ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                  background: isNight ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.5)",
                  color: theme.textMuted,
                }}
              >
                <span style={{ color: theme.text }}>Picco UV</span> previsto intorno alle{" "}
                <span style={{ color: theme.text }}>
                  {String(peakUvHour).padStart(2, "0")}:00
                </span>{" "}
                con UVI <span style={{ color: theme.text }}>{peakUv.toFixed(1)}</span>. Privilegia
                fotoprotezione ad ampio spettro nelle ore centrali.
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ---------------- mini live sparkline ---------------- */

const Sparkline = ({
  series,
  stroke,
  dim,
}: {
  series: number[];
  stroke: string;
  dim?: boolean;
}) => {
  const w = 84;
  const h = 30;
  const step = w / (series.length - 1);
  const pts = series.map((v, i) => `${(i * step).toFixed(1)},${(h - v * (h - 4) - 2).toFixed(1)}`);
  const d = `M${pts.join(" L")}`;
  const area = `${d} L${w},${h} L0,${h} Z`;
  const last = series[series.length - 1];
  const cx = w;
  const cy = h - last * (h - 4) - 2;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-[72px] sm:w-[88px] h-[28px] sm:h-[30px] flex-shrink-0"
      style={{ opacity: dim ? 0.5 : 1 }}
    >
      <defs>
        <linearGradient id={`spk-${stroke.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.32" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spk-${stroke.replace(/[^a-z0-9]/gi, "")})`} />
      <motion.path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.circle
        cx={cx}
        cy={cy}
        r="2"
        fill={stroke}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
};

/* ---------------- Skin Mood panel ---------------- */

const SkinMoodPanel = ({
  info,
  theme,
  isNight,
}: {
  info: SkinMoodInfo;
  theme: (typeof PHASE_THEME)["day"];
  isNight: boolean;
}) => {
  const tok = STATUS_TOKEN[info.status];
  return (
    <div className="grid lg:grid-cols-[1.3fr_1fr] gap-4">
      {/* Primary state card */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-[28px] border backdrop-blur-2xl p-7 md:p-9 overflow-hidden"
        style={{
          background: isNight
            ? "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)"
            : "linear-gradient(160deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 100%)",
          borderColor: isNight ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.7)",
          boxShadow: isNight
            ? "0 30px 80px -40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)"
            : "0 30px 60px -40px rgba(31,37,32,0.22), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        {/* mood aura */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${tok.ring}, transparent 70%)` }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.8, 0.55] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <motion.span
              className="absolute inline-flex h-full w-full rounded-full"
              style={{ background: tok.dot }}
              animate={{ scale: [1, 2.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
            />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: tok.dot }} />
          </span>
          <span className="text-[10px] tracking-[0.32em] uppercase font-body" style={{ color: theme.textMuted }}>
            {info.subtitle}
          </span>
        </div>

        <h3
          className="relative font-display text-4xl md:text-5xl mt-4 leading-[1.05] tracking-tight"
          style={{ color: theme.text }}
        >
          <span className="italic font-light">{info.label}</span>
        </h3>

        <p
          className="relative font-body text-[14px] md:text-[15px] mt-5 max-w-xl leading-relaxed"
          style={{ color: theme.textMuted }}
        >
          {info.description}
        </p>
      </motion.div>

      {/* Bio metrics card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-[28px] border backdrop-blur-2xl p-7 md:p-8 overflow-hidden flex flex-col justify-center"
        style={{
          background: isNight
            ? "linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)"
            : "linear-gradient(160deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.5) 100%)",
          borderColor: isNight ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.7)",
          boxShadow: isNight
            ? "0 20px 50px -30px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)"
            : "0 20px 40px -28px rgba(31,37,32,0.18), inset 0 1px 0 rgba(255,255,255,0.85)",
        }}
      >
        <div className="text-[10px] tracking-[0.32em] uppercase font-body mb-5" style={{ color: theme.textMuted }}>
          Bio-indicatori
        </div>
        <div className="space-y-5">
          {info.metrics.map((m, i) => (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-body text-[12px]" style={{ color: theme.text }}>
                  {m.label}
                </span>
                <span className="font-body text-[10px] tabular-nums" style={{ color: theme.textMuted }}>
                  {m.value}%
                </span>
              </div>
              <div
                className="h-[3px] w-full rounded-full overflow-hidden"
                style={{ background: isNight ? "rgba(255,255,255,0.07)" : "rgba(31,37,32,0.07)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background:
                      m.value >= 70
                        ? "linear-gradient(90deg, rgba(168,184,154,0.95), rgba(168,184,154,0.4))"
                        : m.value >= 50
                          ? "linear-gradient(90deg, rgba(214,178,120,0.95), rgba(214,178,120,0.4))"
                          : "linear-gradient(90deg, rgba(201,128,108,0.95), rgba(201,128,108,0.4))",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${m.value}%` }}
                  transition={{ duration: 1.1, delay: 0.25 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
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
  theme: (typeof PHASE_THEME)["day"];
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="text-center">
    <div className="inline-flex" style={{ color: theme.accent }}>
      {icon}
    </div>
    <div className="text-[9px] tracking-[0.3em] uppercase font-body mt-1" style={{ color: theme.textMuted }}>
      {label}
    </div>
    <div className="font-display text-base mt-1" style={{ color: theme.text }}>
      {value}
    </div>
  </div>
);

const SunArc = ({ phase, theme }: { phase: Phase; theme: (typeof PHASE_THEME)["day"] }) => {
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

/* ---------------- ambient layer ---------------- */

const AmbientLayer = ({ phase, env }: { phase: Phase; env: Env | null }) => {
  const isNight = phase === "night";

  /* UV-driven warmth intensity (0-1) */
  const uv = isNight ? 0 : (env?.uv ?? 0);
  const uvWarmth = Math.min(1, Math.max(0, uv < 3 ? 0 : uv < 6 ? (uv - 3) / 3 : 1));
  const uvCool = Math.min(1, Math.max(0, uv < 3 ? 1 - uv / 3 : 0));

  /* Air-quality haze (0-1) */
  const aqi = env?.aqi ?? 1;
  const aqHaze = Math.min(1, Math.max(0, aqi <= 2 ? 0 : (aqi - 2) / 3));

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* saffron orb (top-left) — UV-responsive warmth */}
      <motion.div
        className="absolute -top-32 -left-24 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(233,178,96,0.35) 0%, transparent 65%)",
        }}
        animate={{
          opacity: isNight ? 0.12 : 0.35 + uvWarmth * 0.35,
          scale: 1 + uvWarmth * 0.15,
        }}
        transition={{ duration: 1.8, ease: "easeOut" }}
      />
      {/* seafoam orb (right) — cool when UV low, subdued when UV high */}
      <motion.div
        className="absolute top-40 -right-32 h-[620px] w-[620px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(150,194,200,0.35) 0%, transparent 65%)",
        }}
        animate={{
          opacity: isNight ? 0.12 : 0.35 + uvCool * 0.35,
          scale: 1 + uvCool * 0.15,
        }}
        transition={{ duration: 1.8, ease: "easeOut" }}
      />
      {/* UV accent glow — warm amber core when UV high */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[480px] w-[600px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(ellipse, rgba(232,196,130,0.45) 0%, transparent 70%)",
        }}
        animate={{
          opacity: isNight ? 0.08 : 0.15 + uvWarmth * 0.4,
          scale: 1 + uvWarmth * 0.2,
        }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      {/* air-quality subtle haze — muted mauve when AQI poor */}
      <motion.div
        className="absolute bottom-1/4 left-1/4 h-[400px] w-[500px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(180,170,190,0.25) 0%, transparent 65%)",
        }}
        animate={{
          opacity: isNight ? 0.05 : aqHaze * 0.35,
          scale: 1 + aqHaze * 0.25,
        }}
        transition={{ duration: 2.2, ease: "easeOut" }}
      />
      {/* cool seafoam bottom accent for low-UV freshness */}
      <motion.div
        className="absolute -bottom-20 left-1/3 h-[360px] w-[480px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(ellipse, rgba(160,200,190,0.30) 0%, transparent 70%)",
        }}
        animate={{
          opacity: isNight ? 0.08 : 0.15 + uvCool * 0.25,
          scale: 1 + uvCool * 0.1,
        }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      {/* fine grain noise */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
};

export default GrowSection;
