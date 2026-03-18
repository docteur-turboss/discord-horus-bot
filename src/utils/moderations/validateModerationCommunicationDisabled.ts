import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { reply } from "utils/discord/reply";

export async function NotValidateModerationCommunicationDisabledOrReply(
  interaction: ChatInputCommandInteraction,
  targetUser: GuildMember
) {
  return checkIfDisabled(interaction, targetUser, "not_validate");
}

export async function ValidateModerationCommunicationDisabledOrReply(
  interaction: ChatInputCommandInteraction,
  targetUser: GuildMember
) {
  return checkIfDisabled(interaction, targetUser, "validate");
}

async function checkIfDisabled(
  interaction: ChatInputCommandInteraction,
  targetUser: GuildMember,
  type: "validate" | "not_validate"
) {
  if (
    (type === "validate" && !targetUser.communicationDisabledUntil) ||
    (type === "not_validate" && targetUser.communicationDisabledUntil)
  ) return false;
  
  reply(interaction, {
      key: type === "validate" ? "errors.user_already_muted" : "errors.user_not_muted",
      ephemeral: true,
      type: "error"
  });
  return true;
}