import { defineMcp } from "@lovable.dev/mcp-js";
import listTeam from "./tools/list-team";
import getTeamMember from "./tools/get-team-member";
import listProducts from "./tools/list-products";
import brandInfo from "./tools/brand-info";

export default defineMcp({
  name: "amarea-cosmetics-mcp",
  title: "Amarea Cosmetics",
  version: "0.1.0",
  instructions:
    "Public tools for Amarea Cosmetics: brand info, product line ('Monti Italiani') and team profiles. All data returned is public.",
  tools: [brandInfo, listProducts, listTeam, getTeamMember],
});