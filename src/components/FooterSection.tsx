import { Instagram, Linkedin } from "lucide-react";
import logoImg from "@/assets/amarea-footer-logo.png";

const FooterSection = () => {
  return (
    <>
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
            <div className="flex items-center gap-4">
              <a
                href="mailto:info@amareacosmetics.it"
                className="font-body text-sm text-primary-foreground hover:text-primary transition-colors px-4 py-2 rounded-full border border-primary-foreground/10 hover:border-primary/30"
              >
                info@amareacosmetics.it
              </a>
              <a
                href="https://www.instagram.com/amareacosmetics?igsh=ZWI1b3hiamNxczAx"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-primary-foreground hover:text-primary transition-colors p-2 rounded-full border border-primary-foreground/10 hover:border-primary/30"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.linkedin.com/company/amareacosmetics/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-primary-foreground hover:text-primary transition-colors p-2 rounded-full border border-primary-foreground/10 hover:border-primary/30"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default FooterSection;
