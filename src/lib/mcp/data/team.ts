// Plain data for MCP tools — no image imports so the entry stays import-safe
// during the Vite plugin's build-time evaluation and the emitted Deno function.

export interface TeamMemberData {
  name: string;
  slug: string;
  role: string;
  title: string;
  shortBio: string;
  email?: string;
  profileUrl: string;
}

const site = "https://amareacosmetics.it";

export const teamMembers: TeamMemberData[] = [
  {
    name: "Dott.ssa Anna Manzella",
    slug: "anna-manzella",
    role: "Founder & CEO",
    title: "Dottoranda in Scienze Biomolecolari",
    shortBio: "Specializzata in biologia della pelle e rigenerazione tissutale.",
    email: "anna.manzella@amareacosmetics.it",
    profileUrl: `${site}/team/anna-manzella`,
  },
  {
    name: "Dott.ssa Alessia Luccarini",
    slug: "alessia-luccarini",
    role: "Laboratory Research & Development",
    title: "PhD in Scienze Biomolecolari",
    shortBio: "Studio di agenti fotoprotettivi naturali.",
    email: "alessia.luccarini@amareacosmetics.it",
    profileUrl: `${site}/team/alessia-luccarini`,
  },
  {
    name: "Dott. Francesco Mengarelli",
    slug: "francesco-mengarelli",
    role: "Business Development",
    title: "Business Development Manager",
    shortBio: "Sviluppo commerciale e partnership strategiche.",
    email: "francesco.mengarelli@amareacosmetics.it",
    profileUrl: `${site}/team/francesco-mengarelli`,
  },
  {
    name: "Dott.ssa Loredana Rao",
    slug: "loredana-rao",
    role: "Regulatory Affairs",
    title: "Consulente Regolatorio Cosmetico",
    shortBio: "Compliance normativa e sicurezza dei prodotti cosmetici.",
    email: "loredana.rao@amareacosmetics.it",
    profileUrl: `${site}/team/loredana-rao`,
  },
  {
    name: "Dott.ssa Alida Likey",
    slug: "alida-likey",
    role: "Marketing & Brand",
    title: "Brand & Marketing Strategist",
    shortBio: "Strategia di brand e comunicazione.",
    email: "alida.likey@amareacosmetics.it",
    profileUrl: `${site}/team/alida-likey`,
  },
  {
    name: "Avv. Alessandra Marmorè",
    slug: "alessandra-marmore",
    role: "Legal Advisor",
    title: "Avvocato",
    shortBio: "Consulenza legale e societaria.",
    email: "alessandramarmore@outlook.it",
    profileUrl: `${site}/team/alessandra-marmore`,
  },
  {
    name: "Prof.ssa Camilla Morresi",
    slug: "camilla-morresi",
    role: "Scientific Advisor",
    title: "Ricercatrice Universitaria",
    shortBio: "Ricerca su composti bioattivi.",
    email: "c.morresi@unilink.it",
    profileUrl: `${site}/team/camilla-morresi`,
  },
  {
    name: "Prof.ssa Elisabetta Damiani",
    slug: "elisabetta-damiani",
    role: "Scientific Advisor",
    title: "Professoressa Ordinaria — Università Politecnica delle Marche",
    shortBio: "Chimica biologica e stress ossidativo.",
    email: "e.damiani@univpm.it",
    profileUrl: `${site}/team/elisabetta-damiani`,
  },
  {
    name: "Prof.ssa Tiziana Bacchetti",
    slug: "tiziana-bacchetti",
    role: "Scientific Advisor",
    title: "Professoressa — Università Politecnica delle Marche",
    shortBio: "Biochimica e nutrizione.",
    email: "t.bacchetti@staff.univpm.it",
    profileUrl: `${site}/team/tiziana-bacchetti`,
  },
];

export interface ProductData {
  slug: string;
  name: string;
  subtitle: string;
  status: string;
  url: string;
}

export const products: ProductData[] = [
  {
    slug: "sibilla",
    name: "Sibilla",
    subtitle: "crema viso anti-aging",
    status: "Prossimamente — Settembre 2026 (lista prioritaria di lancio aperta)",
    url: `${site}/prodotti/sibilla`,
  },
  {
    slug: "conero",
    name: "Conero",
    subtitle: "crema viso purificante",
    status: "In sviluppo",
    url: `${site}/prodotti/conero`,
  },
  {
    slug: "catria",
    name: "Catria",
    subtitle: "crema viso idratante",
    status: "In sviluppo",
    url: `${site}/prodotti/catria`,
  },
];