import { motion } from "framer-motion";

import annaManzella from "@/assets/team/anna-manzella.png";
import alessiaLuccarini from "@/assets/team/alessia-luccarini.png";
import francescoMengarelli from "@/assets/team/francesco-mengarelli.png";
import loredanaRao from "@/assets/team/loredana-rao.png";
import alidaLikey from "@/assets/team/alida-likey.jpeg";
import camillaMorresi from "@/assets/team/camilla-morresi.jpeg";
import elisabettaDamiani from "@/assets/team/elisabetta-damiani.png";
import tizianaBacchetti from "@/assets/team/tiziana-bacchetti.png";
import alessandraMarmore from "@/assets/team/alessandra-marmore.png";

const team = [
  { name: "Dott.ssa Anna Manzella", role: "Dottoranda in Scienze Biomolecolari", desc: "Specializzata in biologia della pelle e rigenerazione tissutale.", image: annaManzella },
  { name: "Dott.ssa Alessia Luccarini", role: "Dottoranda in Scienze Biomolecolari", desc: "Studio di agenti fotoprotettivi naturali.", image: alessiaLuccarini },
  { name: "Dott. Francesco Mengarelli", role: "Dottorando in Scienze Biomolecolari", desc: "Biologo molecolare esperto in tecniche analitiche avanzate.", image: francescoMengarelli },
  { name: "Dott.ssa Loredana Rao", role: "PhD", desc: "Specializzata in analisi di dinamica e funzionalità mitocondriale.", image: loredanaRao },
  { name: "Dott.ssa Alida Likey", role: "Dottoranda in Biomedical Sciences", desc: "Specializzata in skin biology e anti-aging cosmetology.", image: alidaLikey },
  { name: "Dott.ssa Camilla Morresi", role: "Post-doc e Docente", desc: "Esperienza in biochimica della nutrizione e stress ossidativo.", image: camillaMorresi },
  { name: "Prof.ssa Elisabetta Damiani", role: "Professoressa Associata di Biochimica", desc: "Esperta in biochimica e formulazioni cosmetiche innovative.", image: elisabettaDamiani },
  { name: "Prof.ssa Tiziana Bacchetti", role: "Professoressa Associata di Biochimica", desc: "Esperta in stress ossidativo e basi molecolari dell'invecchiamento.", image: tizianaBacchetti },
  { name: "Avv. Alessandra Marmorè", role: "Avvocato", desc: "Specializzata in diritto societario e compliance.", image: alessandraMarmore },
];

const TeamSection = () => {
  return (
    <section id="team" className="py-24 md:py-32 bg-card relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-violet/15 text-violet font-body text-sm font-semibold px-5 py-2 rounded-full mb-6">
            Il nostro team 👩‍🔬
          </span>
          <h2 className="font-display text-4xl md:text-6xl font-extrabold text-card-foreground">
             Esperti al servizio dell'<span className="text-primary">innovazione</span>
          </h2>
           <p className="font-body text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
             Un team di 8 ricercatori impegnati nello sviluppo di formulazioni cosmetiche naturali ed ecosostenibili
           </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group bg-background rounded-3xl p-6 card-hover cursor-default border border-border hover:border-primary/30"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-16 h-16 rounded-2xl object-cover group-hover:rounded-full transition-all duration-500"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">{member.name}</h3>
                  <p className="font-body text-xs text-violet font-semibold tracking-wide">{member.role}</p>
                </div>
              </div>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{member.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
