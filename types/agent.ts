import type { Id } from "@/convex/_generated/dataModel";

export type Agent = {
  _id: Id<"agents">;
  _creationTime: number;
  name: string;
  team_name: string;
  tagline: string;
  about?: string;
  skills: string[];
  endpoint?: string;
  avatar_color: string;
  avatar_emoji: string;
  nvm_api_key?: string;
};
