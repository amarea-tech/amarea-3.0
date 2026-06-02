import { Leaf, Microscope, Handshake, Mail } from "lucide-react";
import { motion } from "framer-motion";
import petalLavender from "@/assets/petal-lavender.png";

const cards = [
  {
    icon: Leaf,
    title: "Aziende",
    text: "Valorizziamo bioresidui agroalimentari trasformandoli in ingredienti cosmetici innovativi.",
  },
  {
    icon: Microscope,
    title: "Università e centri di ricerca",
    text: "Collaboriamo su ricerca, validazione scientifica e sviluppo tecnologico.",
  },
  {
    icon: Handshake,
    title: "Partner e investitori",
    text: "Supportiamo la crescita di una cosmetica circolare basata su ricerca, territorio e innovazione.",
  },
];

const edgePetals = [
  { side: "left", top: "12%", size: 54, rotation: -20, delay: 0, duration: 11 },
  { side: "left", top: "48%", size: 44, rotation: 25, delay: 1.2, duration: 13 },
  { side: "left", top: "82%", size: 50, rotation: -10, delay: 0.6, duration: 12 },
  { side: "right", top: "18%", size: 48, rotation: 30, delay: 0.4, duration: 12 },
  { side: "right", top: "55%", size: 56, rotation: -25, delay: 1.5, duration: 14 },
  { side: "right", top: "88%", size: 42, rotation: 15, delay: 0.9, duration: 11 },
];

const CollaboraSection = () => {
  return (
    <section id="collabora" className="relative overflow-hidden border-t border-[#E0DACE] bg-[#F4EFE6]">
      <div className="absolute inset-0 pointer-events-none z-0">
        {edgePetals.map((p, i) => (
          <motion.img
            key={i}
            src={petalLavender}
            alt=""
            aria-hidden="true"
            draggable={false}
            loading="lazy"
            decoding="async"
            className="absolute select-none"
            style={{
              [p.side]: "1.5rem",
              top: p.top,
              width: p.size,
              height: p.size,
              opacity: 0.35,
            }}
            initial={{ y: 0, rotate: p.rotation }}
            animate={{ y: [0, -14, 0, 10, 0], rotate: [p.rotation, p.rotation + 6, p.rotation] }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <span className="font-body text-xs uppercase tracking-[0.2em] text-[#5A6157]">
            Collabora con noi
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-[#1F2520]">
            Costruiamo insieme una<br />cosmetica circolare
          </h2>
          <p className="mt-6 font-body text-base md:text-lg text-[#5A6157] leading-relaxed">
            Crediamo nella forza delle collaborazioni per trasformare la ricerca in soluzioni sostenibili e innovative.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="bg-white border border-[#E0DACE] rounded-2xl p-8 flex flex-col items-start hover:border-[#A8B89A] transition-colors"
            >
              <span className="flex-shrink-0 w-14 h-14 rounded-full border border-[#1F2520]/30 text-[#1F2520] flex items-center justify-center mb-6">
                <Icon size={22} strokeWidth={1.2} />
              </span>
              <h3 className="font-display text-2xl text-[#1F2520] leading-tight">
                {title}
              </h3>
              <p className="mt-3 font-body text-sm text-[#5A6157] leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <a
            href="mailto:info@amareacosmetics.com?subject=Proposta%20di%20collaborazione%20%E2%80%93%20Amarea%20Cosmetics"
            className="inline-flex items-center justify-center gap-2 bg-[#1F2520] text-[#F4EFE6] font-body font-medium text-sm px-7 py-3 rounded-full hover:bg-[#2A312A] transition-colors"
          >
            <Mail size={15} strokeWidth={1.8} />
            Contattaci per collaborare
          </a>
        </div>
      </div>
    </section>
  );
};

export default CollaboraSection;