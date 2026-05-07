import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { teamMembers } from "@/data/teamData";

const TeamSection = () => {
  const flowers = ["🌸", "🌼", "🌺", "🌷", "🌻", "💮", "🌹", "🏵️", "💐"];
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
             Un team di ricercatori impegnati nello sviluppo di formulazioni cosmetiche naturali ed ecosostenibili
           </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teamMembers.map((member, i) => (
            <motion.div
              key={member.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <Link
                to={`/team/${member.slug}`}
                className="group flex flex-col bg-background rounded-3xl p-6 card-hover border border-border hover:border-primary/30 transition-all h-full"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative shrink-0">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-16 h-16 rounded-2xl object-cover group-hover:rounded-full transition-all duration-500"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 flex items-center justify-center text-[14px] leading-none opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                      <span aria-hidden="true">{flowers[i % flowers.length]}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">{member.name}</h3>
                    <p className="font-body text-xs text-violet font-semibold tracking-wide">{member.role}</p>
                  </div>
                </div>
                <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1">{member.shortBio}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
