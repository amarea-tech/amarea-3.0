import { defineTool } from "@lovable.dev/mcp-js";

const info = {
  name: "Amarea Cosmetics",
  tagline: "Cosmetica biotech, sostenibile e made in Marche.",
  description:
    "Amarea Cosmetics è una start-up di cosmetica scientifica nata come spin-off accademico dell'Università Politecnica delle Marche. Valorizziamo bioresidui agroalimentari del territorio marchigiano attraverso l'upcycling, trasformandoli in ingredienti attivi per formulazioni anti-age e sostenibili.",
  headquarters:
    "Università Politecnica delle Marche, Via Brecce Bianche, Ancona, Italia",
  email: "info@amareacosmetics.com",
  website: "https://amareacosmetics.it",
  values: [
    "Ricerca scientifica",
    "Upcycling e sostenibilità",
    "Valorizzazione del territorio marchigiano",
    "Cruelty-free",
  ],
};

export default defineTool({
  name: "get_brand_info",
  title: "Get brand info",
  description: "Return general information about Amarea Cosmetics (mission, contact, values).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
    structuredContent: info,
  }),
});