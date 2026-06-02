import { Building2, GraduationCap, Handshake, Mail } from "lucide-react";

const cards = [
  {
    icon: Building2,
    title: "Aziende",
    text: "Valorizziamo bioresidui agroalimentari trasformandoli in ingredienti cosmetici innovativi.",
  },
  {
    icon: GraduationCap,
    title: "Università e centri di ricerca",
    text: "Collaboriamo su ricerca, validazione scientifica e sviluppo tecnologico.",
  },
  {
    icon: Handshake,
    title: "Partner e investitori",
    text: "Supportiamo la crescita di una cosmetica circolare basata su ricerca, territorio e innovazione.",
  },
];

const CollaboraSection = () => {
  return (
    <section id="collabora" className="border-t border-[#E0DACE] bg-[#F4EFE6]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <span className="font-body text-xs uppercase tracking-[0.2em] text-[#5A6157]">
            Collabora con noi
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-[#1F2520]">
            Costruiamo insieme una<br />cosmetica circolare
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="bg-white border border-[#E0DACE] rounded-2xl p-8 flex flex-col items-start hover:border-[#A8B89A] transition-colors"
            >
              <span className="flex-shrink-0 w-12 h-12 rounded-full bg-[#1F2520] text-[#F4EFE6] flex items-center justify-center mb-6">
                <Icon size={18} strokeWidth={1.6} />
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