import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { teamMembers } from "../data/team";

export default defineTool({
  name: "get_team_member",
  title: "Get team member",
  description: "Return the full profile of a team member by slug (e.g. 'anna-manzella').",
  inputSchema: {
    slug: z.string().min(1).describe("Team member slug, e.g. 'anna-manzella'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ slug }) => {
    const member = teamMembers.find((m) => m.slug === slug);
    if (!member) {
      return {
        content: [{ type: "text", text: `No team member with slug '${slug}'.` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(member, null, 2) }],
      structuredContent: { member },
    };
  },
});