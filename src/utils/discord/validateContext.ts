import { NotValidateModerationPermissions } from "utils/moderations/validateModerationPermissions";
import { ensureNotGuildInteraction } from "./ensureGuildInteraction";
import { BaseCommandType } from "utils/commands/baseCommand.types";
import { ChatInputCommandInteraction } from "discord.js";

export const validateContext = async (
  interaction: ChatInputCommandInteraction,
  type: BaseCommandType
) => {
  return await ensureNotGuildInteraction(interaction) ||
  ((type === "unmute" || type === "mute") &&
    (await NotValidateModerationPermissions(
      interaction,
      "ModerateMembers",
    ))) ||
  ((type === "unban" || type === "ban") &&
    (await NotValidateModerationPermissions(interaction, "BanMembers"))) ||
  ((type === "rename-member" || type === "reset-member-nickname") &&
    (await NotValidateModerationPermissions(
      interaction,
      "ManageNicknames",
    ))) ||
  (type === "kick" &&
    (await NotValidateModerationPermissions(interaction, "KickMembers"))) ||
  (type === "purge-message" &&
    (await NotValidateModerationPermissions(interaction, "ManageMessages")));
}