import { motion } from "framer-motion";
import { FlaskConical, Recycle, Leaf, Heart } from "lucide-react";

const values = [
  {
    icon: FlaskConical,
    title: "Scienza",
    desc: "Formulazioni naturali e innovative, frutto di ricerca scientifica.",
    color: "bg-primary",
    lightBg: "bg-primary/10",
  },
  {
    icon: Recycle,
    title: "Upcycling",
    desc: "Trasformiamo i materiali di scarto in nuove risorse.",
    color: "bg-secondary",
    lightBg: "bg-secondary/10",
  },
  {
    icon: Leaf,
    title: "Ingredienti Botanici",
    desc: "Solo ingredienti naturali e biologici, selezionati con cura.",
    color: "bg-lime",
    lightBg: "bg-lime/10",
  },
  {
    icon: Heart,
    title: "Cruelty Free",
    desc: "Bellezza senza compromessi etici. Certificati cruelty-free.",
    color: "bg-accent",
    lightBg: "bg-accent/10",
  },
];

const PhilosophySection = () => {
  return (
    <section id="filosofia" className="py-24 md:py-32 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-primary/10 text-primary font-body text-sm font-semibold px-5 py-2 rounded-full mb-6">
            Perché sceglierci ✦
          </span>
          <h2 className="font-display text-4xl md:text-6xl font-extrabold text-foreground">
            La nostra <span className="text-primary">filosofia</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative p-8 rounded-3xl border border-border bg-card hover:bg-foreground hover:border-foreground card-hover cursor-default"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${v.lightBg} transition-all duration-500 mb-6`}>
                <v.icon size={26} strokeWidth={1.5} className="text-foreground group-hover:text-primary-foreground transition-colors duration-500" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary-foreground mb-3 transition-colors duration-500">
                {v.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground group-hover:text-primary-foreground/70 leading-relaxed transition-colors duration-500">
                {v.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhilosophySection;
