import { defineTool } from "@lovable.dev/mcp-js";
import { products } from "../data/team";

export default defineTool({
  name: "list_products",
  title: "List products",
  description:
    "Return the Amarea Cosmetics product line ('Monti Italiani' collection) with launch status.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(products, null, 2) }],
    structuredContent: { products },
  }),
});