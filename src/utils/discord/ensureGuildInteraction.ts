import { ChatInputCommandInteraction } from "discord.js";
import { reply } from "./reply";

export async function ensureGuildInteraction(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await reply(interaction, {
      key: "errors.guild_only",
      ephemeral: true,
      type: "error",
    });

    return false;
  }

  return true;
}