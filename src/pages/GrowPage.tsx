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
  Sparkles,
  Mail,
  Check,
  Loader2,
  ArrowRight,
  Nfc,
  Microscope,
  Users,
  Leaf,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import Fogliolina, { type Mood } from "@/components/grow/Fogliolina";
import { supabase } from "@/integrations/supabase/client";
import univpmLogo from "@/assets/univpm-logo.png";

/* ---------- types ---------- */

type Env = {
  uv: number;
  pm10: number;
  humidity: number;
  pollen: number;
  wind: number;
  temp: number;
  rain: number;
};

type MoodInfo = {
  mood: Mood;
  eyebrow: string;
  title: string;
  body: string;
};

const FALLBACK = { lat: 43.6158, lon: 13.5189, label: "Ancona, Marche" };

/* ---------- mood derivation ---------- */

const deriveMood = (e: Env): MoodInfo => {
  if (e.uv >= 7)
    return {
      mood: "uv",
      eyebrow: "Indice UV alto",
      title: "Oggi la luce è intensa.",
      body: "Fogliolina si schiude con prudenza. Proteggi la barriera cutanea con SPF e gesti minimi.",
    };
  if (e.pm10 >= 50)
    return {
      mood: "smog",
      eyebrow: "Aria carica",
      title: "L'aria pesa un po' oggi.",
      body: "Pollution sopra la soglia. Stasera un rituale detossinante restituirà luminosità alla pelle.",
    };
  if (e.pollen >= 20)
    return {
      mood: "pollen",
      eyebrow: "Pollini in volo",
      title: "C'è movimento nell'aria.",
      body: "Pelle reattiva: detergi con dolcezza e prediligi texture leniscenti, senza profumazioni intense.",
    };
  if (e.rain < 0.2 && e.humidity < 40)
    return {
      mood: "dry",
      eyebrow: "Aria secca",
      title: "L'umidità si è ritirata.",
      body: "Fogliolina ha bisogno di acqua. Rinforza il velo idrolipidico con un siero ricco di attivi umettanti.",
    };
  if (e.rain >= 6)
    return {
      mood: "rainy",
      eyebrow: "Umidità alta",
      title: "L'aria è bagnata e gentile.",
      body: "Lascia respirare la pelle: routine essenziale, niente strati pesanti. La pioggia fa il resto.",
    };
  return {
    mood: "serene",
    eyebrow: "Equilibrio",
    title: "La giornata è in equilibrio.",
    body: "Sole misurato, aria pulita: la pelle riposa. Concediti un gesto lento, senza richieste.",
  };
};

/* ---------- skincare suggestions ---------- */

const skincareFor = (m: Mood) => {
  switch (m) {
    case "uv":
      return [
        { step: "Mattina", title: "Difesa fotostabile", body: "SPF 50 a finitura velata, sopra siero antiossidante alla vitamina C." },
        { step: "Giorno", title: "Idratazione strategica", body: "Mist termale ogni 3 ore per riequilibrare TEWL e calore residuo." },
        { step: "Sera", title: "Riparazione barriera", body: "Crema con niacinamide e ceramidi. Niente esfolianti questa sera." },
      ];
    case "smog":
      return [
        { step: "Mattina", title: "Scudo antipollution", body: "Siero polifenolico con estratti upcycled sopra detersione delicata." },
        { step: "Giorno", title: "Re-mist", body: "Acqua botanica per rimuovere il particolato aderente alla cute." },
        { step: "Sera", title: "Detox notturno", body: "Maschera all'argilla bianca + olio leggero in chiusura per nutrire." },
      ];
    case "pollen":
      return [
        { step: "Mattina", title: "Lenitivo prima di tutto", body: "Detergente non schiumogeno, siero alla centella, niente fragranze." },
        { step: "Giorno", title: "Compresse fredde", body: "Su occhi e zigomi per calmare microinfiammazioni reattive." },
        { step: "Sera", title: "Riparazione gentile", body: "Balsamo con pantenolo e bisabololo. Rituale corto, non stratificato." },
      ];
    case "dry":
      return [
        { step: "Mattina", title: "Layer umettante", body: "Acido ialuronico a basso peso su pelle ancora umida + crema occlusiva." },
        { step: "Giorno", title: "Ricarica", body: "Mist idratante e balsamo labbra rinforzato ogni 4 ore." },
        { step: "Sera", title: "Sleeping mask", body: "Maschera notte ricca di squalano e burri vegetali della Marca." },
      ];
    case "rainy":
      return [
        { step: "Mattina", title: "Routine essenziale", body: "Detersione + idratazione leggera. La pelle non chiede di più." },
        { step: "Giorno", title: "SPF leggero", body: "I raggi passano comunque le nuvole: protezione fluida non comedogena." },
        { step: "Sera", title: "Rituale lento", body: "Olio botanico in massaggio circolare. Tre minuti, nient'altro." },
      ];
    default:
      return [
        { step: "Mattina", title: "Equilibrio", body: "Detersione delicata, siero antiossidante, SPF leggero." },
        { step: "Giorno", title: "Acqua", body: "Idrata dall'interno. La pelle ringrazia in tre giorni." },
        { step: "Sera", title: "Gesto lento", body: "Massaggio facciale di due minuti con olio Monti Italiani." },
      ];
  }
};

/* ---------- page ---------- */

const GrowPage = () => {
  const [env, setEnv] = useState<Env | null>(null);
  const [place, setPlace] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  const fetchAll = async (lat: number, lon: number, fallback = false) => {
    setLoading(true);
    try {
      const meteo = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum,uv_index_max&current=relative_humidity_2m,temperature_2m,wind_speed_10m&timezone=auto&forecast_days=1`;
      const air = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,grass_pollen,birch_pollen,olive_pollen,alder_pollen,ragweed_pollen&timezone=auto`;
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

      setEnv({
        uv: m?.daily?.uv_index_max?.[0] ?? 0,
        pm10: c.pm10 ?? 0,
        humidity: m?.current?.relative_humidity_2m ?? 50,
        pollen,
        wind: m?.current?.wind_speed_10m ?? 0,
        temp: m?.current?.temperature_2m ?? 18,
        rain: m?.daily?.precipitation_sum?.[0] ?? 0,
      });
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

  const moodInfo = useMemo<MoodInfo>(
    () => (env ? deriveMood(env) : { mood: "serene", eyebrow: "In ascolto", title: "Sto leggendo l'ambiente.", body: "Un istante: Fogliolina si sta orientando." }),
    [env],
  );

  const suggestions = skincareFor(moodInfo.mood);

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#2A2A2A]">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-36 md:pt-44 pb-20 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-20 w-[420px] h-[420px] rounded-full bg-[#A8B89A]/25 blur-[120px]" />
          <div className="absolute top-40 -right-32 w-[480px] h-[480px] rounded-full bg-[#C9B8D9]/25 blur-[140px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 md:px-10 grid md:grid-cols-[1.2fr_1fr] gap-10 md:gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-[#6B7864] font-body">
              <Leaf size={13} /> Grow with Amarea
            </span>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.02] mt-5 text-[#1F2520]">
              La pelle è un<br />
              <span className="italic font-light">ecosistema.</span>
            </h1>
            <p className="font-body text-lg md:text-xl text-[#5A6157] mt-6 max-w-md leading-relaxed">
              Fogliolina ascolta l'aria intorno a te e traduce il microclima in gesti concreti per la tua pelle. Botanica, biotech, quotidiana.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <a
                href="#piantina"
                className="inline-flex items-center gap-2 bg-[#1F2520] text-[#F4EFE6] font-body text-sm font-medium px-7 py-3.5 rounded-full hover:bg-[#2A312A] transition-colors"
              >
                Inizia l'esperienza <ArrowRight size={16} />
              </a>
              <Link
                to="/"
                className="font-body text-sm text-[#5A6157] underline-offset-4 hover:underline"
              >
                Torna ad Amarea
              </Link>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <Fogliolina mood={moodInfo.mood} size={420} />
          </div>
        </div>
      </section>

      {/* LA TUA PIANTINA */}
      <section id="piantina" className="relative py-20 md:py-32 bg-[#EDE6D8]">
        <div className="max-w-5xl mx-auto px-6 md:px-10 text-center">
          <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-[#6B7864] font-body">
            <Sparkles size={13} /> La tua piantina
          </span>
          <h2 className="font-display text-4xl md:text-6xl text-[#1F2520] mt-5 leading-[1.05]">
            Fogliolina, oggi.
          </h2>

          <div className="flex items-center justify-center gap-3 mt-5 text-[#5A6157] font-body text-sm">
            <MapPin size={14} />
            <span>{place || "Localizzazione in corso…"}</span>
            {updatedAt && <span className="opacity-60">· aggiornato {updatedAt}</span>}
            <button
              onClick={() => (coords ? fetchAll(coords.lat, coords.lon) : requestLoc())}
              disabled={loading}
              className="ml-2 inline-flex items-center gap-1.5 text-[#1F2520] hover:underline underline-offset-4"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> aggiorna
            </button>
          </div>

          <div className="relative mt-10 md:mt-14 flex flex-col items-center">
            <Fogliolina mood={moodInfo.mood} size={460} />

            <AnimatePresence mode="wait">
              <motion.div
                key={moodInfo.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
                className="mt-4 max-w-xl"
              >
                <p className="text-[11px] tracking-[0.25em] uppercase text-[#8A9080] font-body">
                  {moodInfo.eyebrow}
                </p>
                <h3 className="font-display italic text-2xl md:text-3xl text-[#1F2520] mt-2">
                  {moodInfo.title}
                </h3>
                <p className="font-body text-base text-[#5A6157] mt-3 leading-relaxed">
                  {moodInfo.body}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* DASHBOARD AMBIENTALE */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <span className="text-[11px] tracking-[0.25em] uppercase text-[#6B7864] font-body">
                Dashboard ambientale
              </span>
              <h2 className="font-display text-3xl md:text-5xl text-[#1F2520] mt-3 leading-tight">
                Sei segnali, una sola pelle.
              </h2>
            </div>
            <p className="font-body text-sm text-[#5A6157] max-w-xs">
              Dati in tempo reale dalla tua zona. Nessun rumore, solo ciò che cambia il tuo gesto.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-[#E0DACE]">
            <Tile icon={<Sun size={18} />} label="UV" value={env ? env.uv.toFixed(1) : "—"} hint={env ? uvHint(env.uv) : ""} />
            <Tile icon={<CloudFog size={18} />} label="Pollution" value={env ? `${env.pm10.toFixed(0)} µg` : "—"} hint={env ? pmHint(env.pm10) : ""} />
            <Tile icon={<Droplets size={18} />} label="Humidity" value={env ? `${env.humidity.toFixed(0)}%` : "—"} hint={env ? humHint(env.humidity) : ""} />
            <Tile icon={<Flower2 size={18} />} label="Pollen" value={env ? env.pollen.toFixed(1) : "—"} hint={env ? pollenHint(env.pollen) : ""} />
            <Tile icon={<Wind size={18} />} label="Wind" value={env ? `${env.wind.toFixed(0)} km/h` : "—"} hint={env ? windHint(env.wind) : ""} />
            <Tile icon={<Thermometer size={18} />} label="Temperature" value={env ? `${env.temp.toFixed(0)}°` : "—"} hint={env ? tempHint(env.temp) : ""} />
          </div>
        </div>
      </section>

      {/* SKINCARE SUGGESTIONS */}
      <section className="py-20 md:py-28 bg-[#EDE6D8]">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] tracking-[0.25em] uppercase text-[#6B7864] font-body">
              Rituale del giorno
            </span>
            <h2 className="font-display text-3xl md:text-5xl text-[#1F2520] mt-3 leading-tight">
              Tre gesti, calibrati su <span className="italic">oggi</span>.
            </h2>
            <p className="font-body text-sm md:text-base text-[#5A6157] mt-4 leading-relaxed">
              Ogni mattina Fogliolina riscrive la tua routine in base al microclima. Pochi passaggi, tutti necessari.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {suggestions.map((s, i) => (
              <motion.article
                key={s.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="bg-[#F4EFE6] border border-[#E0DACE] rounded-[1.5rem] p-7 md:p-8 hover:border-[#A8B89A]/60 transition-colors"
              >
                <span className="text-[10px] tracking-[0.3em] uppercase text-[#A8987C] font-body">
                  0{i + 1} · {s.step}
                </span>
                <h3 className="font-display text-2xl md:text-[1.7rem] text-[#1F2520] mt-3 leading-snug">
                  {s.title}
                </h3>
                <p className="font-body text-sm text-[#5A6157] mt-3 leading-relaxed">
                  {s.body}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] tracking-[0.25em] uppercase text-[#6B7864] font-body">
              Community
            </span>
            <h2 className="font-display text-3xl md:text-5xl text-[#1F2520] mt-3 leading-tight">
              Una comunità che <span className="italic">ascolta</span>.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "Da quando seguo Fogliolina, la mia pelle reattiva ha trovato un ritmo.", who: "Giulia, 34 — Ancona" },
              { quote: "Mi piace l'idea che il rituale cambi con il vento. Non sembra più un dovere.", who: "Marta, 28 — Milano" },
              { quote: "L'estetica è quella di una rivista, l'efficacia quella di un dermocosmetico.", who: "Beatrice, 41 — Roma" },
            ].map((t) => (
              <figure key={t.who} className="bg-[#F4EFE6] border border-[#E0DACE] rounded-[1.5rem] p-7">
                <Users size={16} className="text-[#A8B89A]" />
                <blockquote className="font-display italic text-lg text-[#1F2520] mt-4 leading-snug">
                  "{t.quote}"
                </blockquote>
                <figcaption className="font-body text-xs tracking-wide uppercase text-[#8A9080] mt-5">
                  {t.who}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* RESEARCH ECOSYSTEM */}
      <section className="py-20 md:py-28 bg-[#1F2520] text-[#F4EFE6]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 grid md:grid-cols-[1fr_1.1fr] gap-12 items-center">
          <div>
            <span className="text-[11px] tracking-[0.25em] uppercase text-[#A8B89A] font-body">
              Ecosistema di ricerca
            </span>
            <h2 className="font-display text-3xl md:text-5xl mt-3 leading-tight">
              Dietro Fogliolina,<br />
              <span className="italic font-light">un laboratorio.</span>
            </h2>
            <p className="font-body text-sm md:text-base text-[#C7CDC2] mt-5 leading-relaxed max-w-md">
              Amarea nasce nell'incubatore biotech delle Marche. Lavoriamo con docenti universitari su upcycling vegetale e attivi a basso impatto, validati clinicamente.
            </p>

            <div className="mt-8 flex items-center gap-6">
              <img src={univpmLogo} alt="Università Politecnica delle Marche" className="h-12 w-auto opacity-90 brightness-0 invert" />
              <div className="font-body text-xs text-[#A8B89A] leading-snug">
                In partnership con<br />
                <span className="text-[#F4EFE6]">Università Politecnica delle Marche</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-[#2A312A]">
            {[
              { n: "12+", l: "Pubblicazioni scientifiche", i: <Microscope size={18} /> },
              { n: "3", l: "Brevetti depositati", i: <Sparkles size={18} /> },
              { n: "85%", l: "Ingredienti upcycled", i: <Leaf size={18} /> },
              { n: "0", l: "Compromessi sulla pelle", i: <Flower2 size={18} /> },
            ].map((s) => (
              <div key={s.l} className="bg-[#1F2520] p-7">
                <div className="text-[#A8B89A]">{s.i}</div>
                <div className="font-display text-4xl md:text-5xl mt-3">{s.n}</div>
                <div className="font-body text-xs text-[#C7CDC2] mt-2 leading-snug">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NFC */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <div className="bg-[#EDE6D8] border border-[#E0DACE] rounded-[2rem] p-8 md:p-14 grid md:grid-cols-[1fr_1.2fr] gap-10 items-center">
            <div className="flex justify-center">
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-44 h-44 rounded-full bg-[#F4EFE6] border border-[#A8B89A]/40 flex items-center justify-center"
              >
                <Nfc size={56} className="text-[#1F2520]" strokeWidth={1.2} />
                <span className="absolute inset-0 rounded-full border border-[#C9B8D9]/60 animate-ping" />
              </motion.div>
            </div>
            <div>
              <span className="text-[11px] tracking-[0.25em] uppercase text-[#6B7864] font-body">
                NFC · Tap to grow
              </span>
              <h2 className="font-display text-3xl md:text-5xl text-[#1F2520] mt-3 leading-tight">
                Avvicina, e la pianta <span className="italic">cresce</span>.
              </h2>
              <p className="font-body text-sm md:text-base text-[#5A6157] mt-4 leading-relaxed">
                Ogni packaging Amarea custodisce un tag NFC. Lo avvicini al telefono e Fogliolina riceve nutrimento: tracciamo il rituale, restituiamo insight, contribuiamo a un progetto botanico nelle Marche.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="py-24 md:py-36 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-display text-5xl md:text-7xl text-[#1F2520] leading-[1.02]">
              Grow<br />
              <span className="italic font-light">with us.</span>
            </h2>
            <p className="font-body text-base md:text-lg text-[#5A6157] mt-6 max-w-md mx-auto leading-relaxed">
              Una nuova generazione di skincare che cresce con la tua pelle, il tuo tempo e il tuo paesaggio.
            </p>
            <Link
              to="/#prodotti"
              className="inline-flex items-center gap-2 bg-[#1F2520] text-[#F4EFE6] font-body text-sm font-medium px-8 py-4 rounded-full mt-9 hover:bg-[#2A312A] transition-colors"
            >
              Scopri Monti Italiani <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* NEWSLETTER — separated */}
      <NewsletterBlock />

      <FooterSection />
    </div>
  );
};

/* ---------- subcomponents ---------- */

const Tile = ({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint: string }) => (
  <div className="bg-[#F4EFE6] p-6 md:p-8 hover:bg-[#EDE6D8] transition-colors group">
    <div className="flex items-center gap-2 text-[#6B7864]">
      {icon}
      <span className="text-[10px] tracking-[0.3em] uppercase font-body">{label}</span>
    </div>
    <div className="font-display text-4xl md:text-5xl text-[#1F2520] mt-4 leading-none">
      {value}
    </div>
    <div className="font-body text-xs text-[#8A9080] mt-2">{hint}</div>
  </div>
);

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

/* ---------- hint helpers ---------- */

const uvHint = (v: number) => (v < 3 ? "Basso" : v < 6 ? "Moderato" : v < 8 ? "Alto" : "Molto alto");
const pmHint = (v: number) => (v < 25 ? "Aria pulita" : v < 50 ? "Discreta" : "Carica");
const humHint = (v: number) => (v < 40 ? "Secca" : v < 70 ? "Equilibrata" : "Umida");
const pollenHint = (v: number) => (v < 5 ? "Bassi" : v < 20 ? "Moderati" : "Alti");
const windHint = (v: number) => (v < 10 ? "Calmo" : v < 25 ? "Brezza" : "Forte");
const tempHint = (v: number) => (v < 10 ? "Fresco" : v < 22 ? "Mite" : v < 30 ? "Caldo" : "Torrido");

export default GrowPage;