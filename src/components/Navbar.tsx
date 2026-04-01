import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logoImg from "@/assets/amarea-navbar-logo.png";

const navLinks = [
  { label: "Home", href: "/#hero" },
  { label: "Prodotti", href: "/#prodotti" },
  { label: "Chi Siamo", href: "/#chi-siamo" },
  { label: "Team", href: "/#team" },
  { label: "Contatti", href: "/#contatti" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const handleNav = (href: string) => {
    setOpen(false);
    if (location.pathname !== "/" && href.startsWith("/#")) {
      window.location.href = href;
      return;
    }
    const hash = href.replace("/", "");
    const el = document.querySelector(hash);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-4">
        <div className="bg-[#171717] backdrop-blur-xl rounded-full px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logoImg} alt="Amarea Cosmetics" className="h-8 w-auto" />
          </Link>

          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => handleNav(link.href)}
                  className="text-sm font-body font-medium text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 px-4 py-2 rounded-full transition-all duration-300"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleNav("/#contatti")}
            className="hidden md:block bg-primary text-primary-foreground font-body font-semibold text-sm px-6 py-2 rounded-full hover:scale-105 transition-transform duration-300"
          >
            Contattaci 🌸
          </button>

          <button className="md:hidden text-primary-foreground" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="md:hidden mx-4 mt-2 bg-foreground/95 backdrop-blur-xl rounded-3xl overflow-hidden"
          >
            <ul className="flex flex-col items-center gap-2 py-6">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <button
                    onClick={() => handleNav(link.href)}
                    className="text-lg font-body font-medium text-primary-foreground/80 hover:text-primary-foreground px-6 py-2 rounded-full hover:bg-primary-foreground/10 transition-all"
                  >
                    {link.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
