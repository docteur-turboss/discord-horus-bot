import { BaseCommandType } from "utils/commands/baseCommand.types";
import { ChatInputCommandInteraction } from "discord.js";
import { t } from "utils/locales/i18n";

export const getAllVariables = (interaction: ChatInputCommandInteraction, type: BaseCommandType) => {
  const targetUser = !(type === "unban" || type === "purge-message")
    ? interaction.options.getUser("user", true)
    : null;
  const duration =
    type === "mute" ? interaction.options.getInteger("duration", true) : null;
  const userId =
    type === "unban"
      ? interaction.options.getString("user", true).trim()
      : null;
  const nickname =
    (type === "rename-member" || type === "reset-member-nickname")
      ? interaction.options.getString("nickname", true)
      : null;
  const reason = !(type === "unban")
    ? interaction.options.getString("reason") ||
      t(interaction, "moderation.no_reason")
    : "";
  const amountMessage = type === "purge-message"
    ? interaction.options.getInteger("amount", true) : null;
  const targetChannel = type === "purge-message"
    ? interaction.options.getChannel("channel") ?? interaction.channel : null;
  
  return {targetUser, duration, userId, nickname, reason, amountMessage, targetChannel}
}