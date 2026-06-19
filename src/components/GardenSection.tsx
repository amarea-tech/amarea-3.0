import { Sprout, Leaf, Flower2, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import petalSaffronLilac from "@/assets/petal-saffron-lilac.png";
import leafSage from "@/assets/leaf-sage.png";

const tiers = [
  {
    icon: Sprout,
    emoji: "🌱",
    title: "Pianta un seme",
    amount: "3 €",
    text: "Un piccolo gesto per sostenere le prime fasi di ricerca e sviluppo.",
    href: "https://www.paypal.com/ncp/payment/AJXHRHUVDRTVS",
  },
  {
    icon: Leaf,
    emoji: "🌿",
    title: "Coltiva una pianta",
    amount: "10 €",
    text: "Aiutaci a sviluppare nuove formulazioni e a testare nuovi ingredienti botanici.",
    href: "https://www.paypal.com/ncp/payment/ARD6EN7BDXGEU",
  },
  {
    icon: Flower2,
    emoji: "🌸",
    title: "Fai fiorire un progetto",
    amount: "25 €",
    text: "Contribuisci alla crescita di Amarea e alla realizzazione dei nostri prossimi prodotti.",
    href: "https://www.paypal.com/ncp/payment/H45RBQT2PVQB4",
  },
  {
    icon: Heart,
    emoji: "💜",
    title: "Contributo libero",
    amount: "",
    text: "Scegli tu quanto sostenere il nostro percorso.",
    href: "https://www.paypal.com/ncp/payment/CNZ58ZKNTM9WQ",
  },
];

const botanicals = [
  { src: petalSaffronLilac, side: "left", top: "12%", size: 70, rotation: -18, delay: 0, duration: 24, opacity: 0.32 },
  { src: leafSage, side: "left", top: "68%", size: 60, rotation: 18, delay: 1.2, duration: 28, opacity: 0.4 },
  { src: leafSage, side: "right", top: "18%", size: 56, rotation: -14, delay: 0.6, duration: 26, opacity: 0.38 },
  { src: petalSaffronLilac, side: "right", top: "74%", size: 68, rotation: 22, delay: 1.8, duration: 30, opacity: 0.3 },
];

const GardenSection = () => {
  const [thanks, setThanks] = useState(false);
  const timerRef = useRef<number | null>(null);

  const handleSupport = () => {
    setThanks(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setThanks(false), 12000);
  };

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  return (
    <section id="giardino" className="relative overflow-hidden border-t border-[#E0DACE] bg-[#FAF6EE]">
      <div className="absolute inset-0 pointer-events-none z-0">
        {botanicals.map((p, i) => (
          <motion.img
            key={i}
            src={p.src}
            alt=""
            aria-hidden="true"
            draggable={false}
            loading="lazy"
            decoding="async"
            className="absolute select-none"
            style={{ [p.side]: "1.5rem", top: p.top, width: p.size, height: p.size, opacity: p.opacity }}
            initial={{ y: 0, rotate: p.rotation }}
            animate={{ y: [0, -10, 0, 8, 0], rotate: [p.rotation, p.rotation + 4, p.rotation - 2, p.rotation] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <span className="font-body text-xs uppercase tracking-[0.2em] text-[#5A6157]">
            Sostieni il progetto
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-[#1F2520]">
            🌿 Il Giardino di Amarea
          </h2>
          <div className="mt-6 space-y-4 font-body text-base md:text-lg text-[#5A6157] leading-relaxed">
            <p>Ogni formulazione nasce da un seme: un'idea, una ricerca, una pianta da valorizzare.</p>
            <p>Con il tuo contributo ci aiuti a trasformare anni di ricerca scientifica in cosmetici innovativi e sostenibili.</p>
            <p className="italic">Ogni gesto, anche il più piccolo, contribuisce alla crescita di Amarea.</p>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map(({ icon: Icon, emoji, title, amount, text, href }) => (
            <a
              key={title}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleSupport}
              className="group bg-white border border-[#D9CFBE] rounded-2xl p-7 flex flex-col items-center text-center shadow-[0_8px_24px_-12px_rgba(120,90,50,0.18)] hover:border-[#A8B89A] hover:shadow-[0_12px_28px_-12px_rgba(120,90,50,0.25)] hover:-translate-y-1 transition-all duration-300"
            >
              <span className="flex-shrink-0 w-[64px] h-[64px] rounded-full border border-[#1F2520]/40 text-[#1F2520] flex items-center justify-center mb-5 group-hover:bg-[#A8B89A]/15 transition-colors">
                <Icon size={26} strokeWidth={1.3} />
              </span>
              <div className="font-display text-xl text-[#1F2520] leading-tight">
                <span className="mr-1.5">{emoji}</span>{title}
              </div>
              {amount && (
                <div className="mt-2 font-display text-2xl text-[#1F2520]">
                  {amount}
                </div>
              )}
              <p className="mt-3 font-body text-sm text-[#5A6157] leading-relaxed">
                {text}
              </p>
            </a>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-3">
          <a
            href="https://www.paypal.com/ncp/payment/CNZ58ZKNTM9WQ"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleSupport}
            className="inline-flex items-center justify-center gap-2 bg-[#1F2520] text-[#F4EFE6] font-body font-medium text-sm px-8 py-3.5 rounded-full hover:bg-[#2A312A] transition-colors"
          >
            <Heart size={15} strokeWidth={1.8} />
            Sostieni Amarea
          </a>
          <span className="font-body text-xs text-[#5A6157]/80">
            Pagamento sicuro tramite PayPal
          </span>
        </div>

        <AnimatePresence>
          {thanks && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mt-10 mx-auto max-w-2xl text-center bg-white/80 backdrop-blur-sm border border-[#D9CFBE] rounded-2xl px-8 py-7 shadow-[0_8px_24px_-12px_rgba(120,90,50,0.18)]"
            >
              <div className="flex justify-center mb-3">
                <span className="w-11 h-11 rounded-full bg-[#A8B89A]/20 text-[#1F2520] flex items-center justify-center">
                  <Heart size={20} strokeWidth={1.4} />
                </span>
              </div>
              <h3 className="font-display text-2xl text-[#1F2520] leading-tight">
                Grazie di cuore 🌿
              </h3>
              <p className="mt-2 font-body text-sm md:text-base text-[#5A6157] leading-relaxed">
                Il tuo contributo fa la differenza. Completa la donazione nella scheda PayPal appena aperta: ogni gesto aiuta Amarea a crescere.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default GardenSection;