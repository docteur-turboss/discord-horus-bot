import { ChatInputCommandInteraction } from "discord.js";
import { followUp, reply } from "utils/discord/reply";
import { logger } from "utils/logger/logger";

export const catchErrorInCommand = async (error: unknown, interaction: ChatInputCommandInteraction, commandName: string) => {
  logger.error(`Error executing ${commandName} command:`, error as Record<string, unknown>);

  if (!interaction.replied)
    return await reply(interaction, {
      key: "errors.command_execution",
      ephemeral: true,
      type: "error",
    });

  return await followUp(interaction, {
    key: "errors.command_execution",
    ephemeral: true,
    type: "error",
  });
};