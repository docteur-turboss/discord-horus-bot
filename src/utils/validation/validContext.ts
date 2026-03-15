import { ChatInputCommandInteraction } from "discord.js";

export const isInGuild = async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.guild) return "errors.guild_only";
  return null;
}