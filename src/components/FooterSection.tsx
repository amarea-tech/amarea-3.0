import { motion } from "framer-motion";
import { Mail, ArrowUpRight } from "lucide-react";
import logoImg from "@/assets/amarea-footer-logo.png";

const FooterSection = () => {
  return (
    <>
      <section id="contatti" className="py-24 md:py-32 bg-primary relative overflow-hidden">
        <div className="absolute top-10 left-10 w-40 h-40 bg-primary-foreground/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-secondary/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold text-primary-foreground mb-6 leading-tight">
              Collabora con noi 🌸
            </h2>
            <p className="font-body text-primary-foreground/70 max-w-xl mx-auto mb-10 leading-relaxed text-lg">
              Sei un ricercatore, un'università o un'azienda interessata a progetti di ricerca nel campo della cosmesi naturale e sostenibile?
            </p>
            <a
              href="mailto:info@amareacosmetics.it?subject=Richiesta%20Collaborazione%20Scientifica"
              className="group inline-flex items-center gap-3 bg-primary-foreground text-primary font-body font-bold text-lg px-10 py-4 rounded-full hover:scale-105 hover:shadow-2xl transition-all duration-500"
            >
              <Mail size={20} />
              Contattaci
              <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
            </a>
          </motion.div>
        </div>
      </section>

      <div className="bg-foreground py-4 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="font-display text-lg font-bold text-primary-foreground/20 flex items-center gap-8">
              AMAREA COSMETICS <span className="text-primary">✦</span> NATURAL BEAUTY <span className="text-secondary">✦</span> SCIENZA & NATURA <span className="text-accent">✦</span>
            </span>
          ))}
        </div>
      </div>

      <footer className="py-16 bg-foreground">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <img src={logoImg} alt="Amarea Cosmetics" className="h-8 w-auto" />
            </div>
            <p className="font-body text-sm text-primary-foreground">
              © {new Date().getFullYear()} Amarea Cosmetics — Spin-off Università Politecnica delle Marche
            </p>
            <a
              href="mailto:info@amareacosmetics.it"
              className="font-body text-sm text-primary-foreground/60 hover:text-primary transition-colors px-4 py-2 rounded-full border border-primary-foreground/10 hover:border-primary/30"
            >
              info@amareacosmetics.it
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default FooterSection;
