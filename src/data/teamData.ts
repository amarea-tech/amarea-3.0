import annaManzella from "@/assets/team/anna-manzella.png";
import alessiaLuccarini from "@/assets/team/alessia-luccarini.png";
import francescoMengarelli from "@/assets/team/francesco-mengarelli.png";
import loredanaRao from "@/assets/team/loredana-rao.png";
import alidaLikey from "@/assets/team/alida-likey.jpeg";
import camillaMorresi from "@/assets/team/camilla-morresi.jpeg";
import elisabettaDamiani from "@/assets/team/elisabetta-damiani.png";
import tizianaBacchetti from "@/assets/team/tiziana-bacchetti.png";
import alessandraMarmore from "@/assets/team/alessandra-marmore.png";

export interface TeamMember {
  name: string;
  slug: string;
  role: string;
  title: string;
  desc: string;
  shortBio: string;
  fullBio: string;
  image: string;
  email?: string;
}

export const teamMembers: TeamMember[] = [
  {
    name: "Dott.ssa Anna Manzella",
    slug: "anna-manzella",
    role: "Founder & CEO",
    title: "Dottoranda in Scienze Biomolecolari",
    desc: "Fondatrice e formulatrice di Amarea Cosmetics, traduce la ricerca in prodotti tangibili. La sua supervisione garantisce che ogni cosmetico sviluppato sia supportato da solidi principi di sostenibilità ed efficacia.",
    shortBio: "Specializzata in biologia della pelle e rigenerazione tissutale.",
    fullBio: `Il percorso di Anna nasce dall'incontro tra una rigorosa formazione in Biologia Molecolare e Applicata e una profonda passione per la cosmesi. Questa sinergia l'ha spinta a orientare la sua carriera accademica verso lo studio della pelle, utilizzando le sue competenze biologiche per comprendere a fondo i reali bisogni dei tessuti a livello cellulare. Attualmente Dottoranda in Scienze Biomolecolari all'Università Politecnica delle Marche, si è occupata dello studio della rigenerazione tissutale e dei meccanismi della barriera cutanea, forte di esperienze maturate tra accademia e industria, anche in contesti internazionali. Amarea nasce proprio dalla volontà di superare i confini della ricerca puramente teorica, per dare un'applicazione concreta a questi studi. In qualità di Founder, CEO e responsabile della formulazione, Anna fa da ponte tra il laboratorio e le persone per trasformare i dati e l'innovazione scientifica in prodotti tangibili, assicurando efficacia e sostenibilità.`,
    image: annaManzella,
    email: "anna.manzella@amareacosmetics.com",
  },
  {
    name: "Dott.ssa Alessia Luccarini",
    slug: "alessia-luccarini",
    role: "Laboratory Research & Development",
    title: "PhD in Scienze Biomolecolari",
    desc: "Responsabile del coordinamento progetti nel team R&D, contribuisce allo sviluppo di prodotti sostenibili, validando attivi naturali. Il suo lavoro si focalizza sullo studio di agenti fotoprotettivi naturali ed è fondamentale per assicurare che le formule cosmetiche rispondano alle reali esigenze di protezione della pelle, supportate da evidenze scientifiche inconfutabili.",
    shortBio: "Studio di agenti fotoprotettivi naturali.",
    fullBio: `Il percorso di Alessia si fonda su una rigorosa formazione in Biologia Molecolare e Applicata, unita alla forte spinta di esplorare le potenzialità della natura applicate alla cosmesi. Questa sinergia l'ha portata a orientare la sua carriera scientifica verso lo studio di agenti fotoprotettivi naturali derivati da piante e organismi marini, ponendo le basi per soluzioni cosmetiche sempre più all'avanguardia.
PhD in Scienze Biomolecolari presso l'Università Politecnica delle Marche, dedica la sua ricerca alla caratterizzazione di nuovi composti naturali come filtri UV eco-friendly. Attraverso l'utilizzo di colture cellulari cutanee, analisi molecolari, saggi di fotobiologia e microscopia, indaga il potenziale protettivo di questi attivi, forte di un'importante esperienza internazionale presso il Dipartimento di Dermatologia della Medical University of Vienna e della co-autorialità di numerose pubblicazioni scientifiche su riviste peer-reviewed.
La collaborazione con Amarea nasce proprio dalla volontà di dare un'applicazione concreta a questi complessi studi, portando l'innovazione direttamente sulla pelle delle persone.`,
    image: alessiaLuccarini,
    email: "alessia.luccarini@amareacosmetics.com",
  },
  {
    name: "Dott. Francesco Mengarelli",
    slug: "francesco-mengarelli",
    role: "Laboratory Research & Development",
    title: "Dottorando in Scienze Biomolecolare",
    desc: "Esperienza nello studio del ruolo dello stress ossidativo in condizioni fisiopatologiche.",
    shortBio: "Biologo molecolare esperto in tecniche analitiche avanzate.",
    fullBio: `Dottorando in Scienze della Vita e dell'Ambiente presso l'Università Politecnica delle Marche, con una formazione in Biologia Molecolare e Applicata. Il suo percorso di ricerca è focalizzato sullo studio del ruolo dello stress ossidativo in condizioni fisiopatologiche. Ha maturato esperienza nel lavoro con colture cellulari primarie, utilizzando tecniche avanzate di citofluorimetria, spettrofotometria e spettrofluorimetria, oltre a saggi di biologia molecolare e analisi HPLC.

È autore e coautore di pubblicazioni scientifiche su riviste internazionali, a testimonianza di un approccio rigoroso e orientato alla qualità della ricerca.

All'interno di Amarea fa parte del team di Laboratory Research & Development, contribuendo allo studio sperimentale degli attivi e alla validazione scientifica delle formulazioni. Il suo lavoro è essenziale per garantire che i prodotti siano supportati da dati affidabili e sviluppati secondo un approccio scientifico solido, con particolare attenzione alla sicurezza e all'efficacia.`,
    image: francescoMengarelli,
  },
  {
    name: "Dott.ssa Loredana Rao",
    slug: "loredana-rao",
    role: "Packaging & Production Development",
    title: "PhD in Scienze Biomolecolari",
    desc: "Specializzata in analisi di dinamica, funzionalità e metabolismo mitocondriale su modelli cellulari tumorali.",
    shortBio: "Specializzata in analisi di dinamica e funzionalità mitocondriale.",
    fullBio: `PhD in Biomolecular Sciences presso l'Università Politecnica delle Marche, con una formazione in Biologia Molecolare e Applicata e un solido background di ricerca nel campo della biologia cellulare, della morfologia funzionale e dei processi mitocondriali. La sua attività scientifica si è sviluppata in ambito accademico attraverso l'utilizzo di modelli cellulari, tecniche avanzate di microscopia, analisi strutturali e metodologie sperimentali applicate allo studio dello stress ossidativo e della funzionalità cellulare.

In Amarea ricopre il ruolo di Packaging & Production Development, dove mette le sue competenze scientifiche al servizio dello sviluppo di soluzioni produttive e di confezionamento affidabili, sicure e coerenti con i valori di sostenibilità del brand. Il suo contributo è fondamentale per garantire che ogni prodotto non sia solo efficace dal punto di vista formulativo, ma anche progettato con attenzione alla qualità, alla stabilità e all'impatto ambientale.`,
    image: loredanaRao,
    email: "loredana.rao@amareacosmetics.com",
  },
  {
    name: "Dott.ssa Alida Likey",
    slug: "alida-likey",
    role: "Digital & Social Media",
    title: "Dottoranda in Scienze Biomediche",
    desc: "Con un background in biologia della pelle e cosmetologia anti-aging, in veste di divulgatrice, traduce la ricerca in contenuti chairi e trasparenti, guidando la community verso scelte di cura della pelle consapevoli e basate sui dati scientificamente testati.",
    shortBio: "Specializzata in biologia della pelle e cosmetologia anti-aging.",
    fullBio: `Possiede una formazione scientifica avanzata in Biologia Molecolare ed è attualmente dottoranda presso l'Università Politecnica delle Marche. Il suo percorso di ricerca si è concentrato su stress ossidativo, tossicologia cellulare, rigenerazione dei tessuti e biologia della pelle, con esperienza maturata sia in ambito accademico che industriale, anche a livello internazionale.

Accanto alla ricerca, ha sviluppato competenze nel mondo della cosmesi applicata e del contatto diretto con il consumatore, lavorando come promoter per brand cosmetici e profumieri e approfondendo le dinamiche di comunicazione e percezione del prodotto.

All'interno di Amarea ricopre il ruolo di Digital & Social Media Manager, dove unisce competenze scientifiche e comunicative per tradurre la ricerca cosmetica in contenuti chiari, affidabili e comprensibili. Il suo lavoro è volto a rendere accessibili i meccanismi biologici alla base delle formulazioni, promuovendo una comunicazione trasparente, consapevole e coerente con i valori di efficacia e sostenibilità del brand.`,
    image: alidaLikey,
    email: "alida.likey@amareacosmetics.it",
  },
  {
    name: "Avv. Alessandra Marmorè",
    slug: "alessandra-marmore",
    role: "Legal Consultant",
    title: "Avvocato specializzato in diritto societario",
    desc: "Supporta Amarea nella gestione degli aspetti legali e di compliance, garantendo trasparenza e conformità.",
    shortBio: "Specializzata in diritto societario e compliance.",
    fullBio: `Laureata in Giurisprudenza, con una formazione focalizzata sul diritto penale, civile e sulla responsabilità degli enti, con particolare attenzione ai temi della compliance aziendale e della prevenzione del rischio legale. Ha maturato esperienza in studi legali occupandosi di diritto societario, contrattualistica, privacy, gestione del debito e consulenza legale alle imprese.

All'interno di Amarea ricopre il ruolo di Legal Consultant, affiancando il team nella gestione degli aspetti giuridici e regolatori legati allo sviluppo del brand. Il suo contributo è fondamentale per garantire solidità, correttezza e trasparenza nelle scelte aziendali, supportando una crescita strutturata e conforme ai requisiti normativi.`,
    image: alessandraMarmore,
    email: "alessandramarmore@outlook.it",
  },
  {
    name: "Prof.ssa Camilla Morresi",
    slug: "camilla-morresi",
    role: "Event & Promotions",
    title: "Professoressa in Biochimica presso Link Campus University",
    desc: "Comprovata esperienza pluriennale nel campo della Biochimica, con focus sulla biochimica della nutrizione e stress ossidativo.",
    shortBio: "Esperienza in biochimica della nutrizione e stress ossidativo.",
    fullBio: `Professoressa presso Link Campus University con formazione scientifica in ambito biochimico e nutrizionale e un'esperienza maturata in contesti di ricerca e formazione. Accanto al percorso accademico, ha sviluppato competenze organizzative e relazionali, con particolare attenzione alla progettazione di eventi e iniziative rivolte al pubblico.

Titolare di plurimi assegni di ricerca, ha sviluppato significative competenze nella gestione di progetti di ricerca. L'attività di ricerca si è concretizzata in 23 pubblicazioni su riviste internazionali ad alto impatto.

All'interno di Amarea ricopre il ruolo di Events & Promotions, occupandosi della pianificazione e gestione di eventi, fiere, attività sul territorio e iniziative di promozione del brand. Il suo lavoro è orientato a creare occasioni di incontro tra Amarea e le persone, favorendo un'esperienza diretta del prodotto e dei valori del marchio.`,
    image: camillaMorresi,
    email: "c.morresi@unilink.it",
  },
  {
    name: "Prof.ssa Elisabetta Damiani",
    slug: "elisabetta-damiani",
    role: "Scientific Advisor",
    title: "Professoressa Associata di Biochimica",
    desc: "Oltre trent'anni di esperienza nella ricerca su radicali liberi, antiossidanti e fotobiologia. Autrice di oltre 110 pubblicazioni scientifiche e 4 brevetti.",
    shortBio: "Esperta in biochimica e formulazioni cosmetiche innovative.",
    fullBio: `Professoressa Associata di Biochimica presso l'Università Politecnica delle Marche, con oltre trent'anni di esperienza nella ricerca su radicali liberi, antiossidanti, fotobiologia e filtri solari. Autrice di oltre 110 pubblicazioni scientifiche e 4 brevetti.

La sua ricerca attuale si focalizza sui meccanismi di fotoprotezione e sullo sviluppo di molecole naturali e sintetiche ad applicazione cosmetica e biomedica.

All'interno di Amarea, ricopre il ruolo di Scientific Advisor, supportando lo sviluppo e la validazione scientifica delle formulazioni. Il suo contributo garantisce un approccio rigoroso allo studio dei meccanismi di fotoprotezione e all'impiego di molecole naturali e sintetiche ad applicazione cosmetica, assicurando l'efficacia e la solidità scientifica dei prodotti.`,
    image: elisabettaDamiani,
  },
  {
    name: "Prof.ssa Tiziana Bacchetti",
    slug: "tiziana-bacchetti",
    role: "Scientific Advisor",
    title: "Professoressa Associata di Biochimica",
    desc: "Presidente del CdLM in Scienze dell'Alimentazione, esperta in stress ossidativo e basi molecolari dell'invecchiamento, con oltre 115 pubblicazioni scientifiche.",
    shortBio: "Esperta in stress ossidativo e basi molecolari dell'invecchiamento.",
    fullBio: `Professoressa Associata di Biochimica presso il DiSVA dell'Università Politecnica delle Marche e Presidente del Corso di Laurea Magistrale in Scienze dell'Alimentazione e Nutrizione. La sua attività di ricerca è incentrata sullo studio della relazione tra alimentazione e salute, con particolare attenzione ai meccanismi biochimici dello stress ossidativo.

Autrice di oltre 115 articoli su riviste scientifiche internazionali peer-reviewed.

In Amarea opera come Scientific Advisor, contribuendo alla definizione del razionale scientifico dei prodotti e all'inquadramento dei processi biologici alla base dell'invecchiamento cutaneo. La sua esperienza assicura che l'innovazione cosmetica di Amarea sia fondata su evidenze scientifiche solide e aggiornate.`,
    image: tizianaBacchetti,
  },
];
