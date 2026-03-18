import { ChatInputCommandInteraction } from "discord.js";
import { reply } from "./reply";

export async function ensureNotGuildInteraction(interaction: ChatInputCommandInteraction) {
  if (interaction.guild) return false;
  
  reply(interaction, {
    key: "errors.guild_only",
    ephemeral: true,
    type: "error",
  });
  return false;
}