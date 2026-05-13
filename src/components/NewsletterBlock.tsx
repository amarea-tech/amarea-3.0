import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Check, Loader2, Sparkles, Instagram, Linkedin, ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
    <section id="contatti" className="border-t border-[#E0DACE] bg-[#F4EFE6]">
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-20 md:py-28 text-center">
        <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-[#6B7864] font-body">
          <Sparkles size={13} /> Collabora con noi
        </span>
        <h3 className="font-display text-3xl md:text-5xl text-[#1F2520] mt-4 leading-tight">
          Costruiamo insieme la prossima ricerca.
        </h3>
        <p className="font-body text-sm md:text-base text-[#5A6157] mt-3 max-w-md mx-auto leading-relaxed">
          Sei un ricercatore, un'università o un'azienda interessata a progetti nel campo della cosmesi naturale e
          sostenibile?
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          <a
            href="mailto:info@amareacosmetics.it?subject=Richiesta%20Collaborazione%20Scientifica"
            className="group inline-flex items-center gap-2 bg-[#1F2520] text-[#F4EFE6] font-body font-medium text-sm px-5 py-3 rounded-full hover:bg-[#2A312A] transition-colors"
          >
            <Mail size={15} />
            Contattaci
            <ArrowUpRight
              size={14}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </a>
          <a
            href="https://www.instagram.com/amareacosmetics?igsh=ZWI1b3hiamNxczAx"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="inline-flex items-center gap-2 bg-white text-[#1F2520] border border-[#E0DACE] font-body font-medium text-sm px-5 py-3 rounded-full hover:border-[#A8B89A] transition-colors"
          >
            <Instagram size={15} /> Instagram
          </a>
          <a
            href="https://www.linkedin.com/company/amareacosmetics/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="inline-flex items-center gap-2 bg-white text-[#1F2520] border border-[#E0DACE] font-body font-medium text-sm px-5 py-3 rounded-full hover:border-[#A8B89A] transition-colors"
          >
            <Linkedin size={15} /> LinkedIn
          </a>
        </div>

        <div className="my-14 flex items-center gap-4 max-w-xs mx-auto">
          <span className="flex-1 h-px bg-[#E0DACE]" />
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#A8987C] font-body">oppure</span>
          <span className="flex-1 h-px bg-[#E0DACE]" />
        </div>

        <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-[#6B7864] font-body">
          <Mail size={13} /> Newsletter
        </span>
        <h3 className="font-display text-3xl md:text-5xl text-[#1F2520] mt-4 leading-tight">Tienimi aggiornato</h3>

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
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="sr-only"
            />
            <span className="font-body text-xs text-[#5A6157] leading-relaxed">
              Acconsento al trattamento dei miei dati personali per ricevere la newsletter, ai sensi della Privacy
              Policy.
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

export default NewsletterBlock;