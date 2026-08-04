import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Check, Loader2, Sparkles, Clock, Gem, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const NewsletterBlock = () => {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [subscribed, setSubscribed] = useState(false);

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
      setSubscribed(true);
      setEmail("");
      setConsent(false);
    } catch (err) {
      setResult({ type: "error", msg: err instanceof Error ? err.message : "Riprova tra poco." });
    } finally {
      setSubscribing(false);
    }
  };

  const benefits = [
    { icon: Clock, text: "Accesso anticipato alla prevendita" },
    { icon: Gem, text: "10% di sconto sul primo ordine" },
    { icon: Lock, text: "" },
  ];

  return (
    <section id="contatti" className="border-t border-[#E0DACE] bg-[#F4EFE6]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
        <div className="max-w-2xl mx-auto">
          {/* Content */}
          <div>
            <h3 className="font-display md:text-5xl lg:text-6xl leading-[1.05] text-left text-5xl text-[#2a2927] rounded-md shadow">
              Sibilla<br />Presto disponibile
            </h3>

            <ul className="mt-8 flex flex-col gap-3 font-bold">
              {benefits.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1F2520] text-[#F4EFE6] flex items-center justify-center">
                    <Icon size={13} strokeWidth={1.8} />
                  </span>
                  <span className="font-body text-sm text-[#1F2520]">{text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 pt-8 border-t border-[#E0DACE]">
          <AnimatePresence mode="wait">
            {subscribed ? (
              <motion.div
                key="ok"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md"
              >
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1F2520] text-[#F4EFE6] mb-5">
                  <Check size={18} strokeWidth={2} />
                </span>
                <p className="font-display text-xl md:text-2xl text-[#1F2520] leading-snug">
                  Grazie per la tua iscrizione alla lista prioritaria di Sibilla.
                </p>
                <p className="font-body text-sm text-[#5A6157] mt-3 leading-relaxed">
                  Ti contatteremo quando la prevendita sarà disponibile.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center"
              >
                <h4 className="font-display md:text-3xl text-[#1F2520] leading-tight text-2xl text-center">
                  ✨ Lista prioritaria di lancio ✨
                </h4>

                <form onSubmit={submit} className="mt-5 flex flex-col gap-3 max-w-md w-full mx-auto items-center text-center">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Inserisci la tua email"
                      maxLength={255}
                      className="flex-1 rounded-full bg-white border border-[#E0DACE] px-5 py-3 font-body text-sm text-[#1F2520] placeholder:text-[#A8987C] focus:outline-none focus:border-[#A8B89A] transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={subscribing}
                      className="inline-flex items-center justify-center gap-2 bg-[#1F2520] text-[#F4EFE6] font-body font-medium text-sm px-6 py-3 rounded-full hover:bg-[#2A312A] transition-colors disabled:opacity-60 whitespace-nowrap"
                    >
                      {subscribing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={15} />}
                      Voglio essere tra i primi
                    </button>
                  </div>

                  <p className="font-body text-xs text-[#6B7864] leading-relaxed">
                    Riceverai l'accesso anticipato prima dell'apertura ufficiale delle vendite.
                  </p>

                  <p className="font-body text-xs text-[#6B7864] leading-relaxed">
                    Ti contatteremo esclusivamente per aggiornamenti sul lancio di Sibilla e sulle iniziative Amarea.
                  </p>

                  <label className="flex items-start gap-2.5 cursor-pointer group select-none text-left">
                    <span
                      className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-[4px] border transition-all flex items-center justify-center ${
                        consent ? "bg-[#1F2520] border-[#1F2520]" : "bg-white border-[#E0DACE] group-hover:border-[#A8B89A]"
                      }`}
                    >
                      {consent && <Check size={12} className="text-[#F4EFE6]" strokeWidth={3} />}
                    </span>
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="sr-only"
                    />
                    <span className="font-body text-xs text-[#5A6157] leading-relaxed">
                      Acconsento al trattamento dei miei dati personali per ricevere comunicazioni relative al lancio
                      di Sibilla e alle iniziative Amarea Cosmetics.
                    </span>
                  </label>

                  <AnimatePresence mode="wait">
                    {result && result.type === "error" && (
                      <motion.p
                        key={result.msg}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="font-body text-xs text-[#A85C5C]"
                      >
                        {result.msg}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterBlock;