import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { teamMembers } from "../data/team";

export default defineTool({
  name: "list_team_members",
  title: "List team members",
  description:
    "Return the Amarea Cosmetics team: name, role, title, short bio, email and profile slug.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(teamMembers, null, 2) }],
    structuredContent: { members: teamMembers },
  }),
});

export const _z = z;