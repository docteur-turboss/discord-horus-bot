import { NotValidateModerationCommunicationDisabledOrReply, ValidateModerationCommunicationDisabledOrReply } from "utils/moderations/validateModerationCommunicationDisabled";
import { NotValidateModerationModeratable } from "utils/moderations/validateModerationModeratable";
import { NotValidateModerationManageable } from "utils/moderations/validateModerationManageable";
import { NotValidateModerationBannable } from "utils/moderations/validateModerationBannable";
import { NotValidateModerationKickable } from "utils/moderations/validateModerationKickable";
import { NotValidateModerationTarget } from "utils/moderations/validateModerationTarget";
import { NotValidateRoleHierarchy } from "utils/moderations/validateRoleHierarchy";
import { ChatInputCommandInteraction, GuildMember, User } from "discord.js";
import { BaseCommandType } from "utils/commands/baseCommand.types";

export const GlobalValidation = async (interaction: ChatInputCommandInteraction, targetMember: GuildMember | null, targetUser: User | null, type: BaseCommandType ) => {
  return (targetMember && (
    ((type === "unmute" || type === "mute") &&
      (await NotValidateModerationModeratable(interaction, targetMember))) ||
    (type === "unmute" &&
      (await NotValidateModerationCommunicationDisabledOrReply(
        interaction,
        targetMember,
      ))) ||
    (type === "mute" &&
      (await ValidateModerationCommunicationDisabledOrReply(
        interaction,
        targetMember,
      ))) ||
    ((type === "rename-member" || type === "reset-member-nickname") &&
      (await NotValidateModerationManageable(interaction, targetMember))) ||
    (type === "kick" &&
      (await NotValidateModerationKickable(interaction, targetMember))) ||
    (type === "ban" &&
      (await NotValidateModerationBannable(interaction, targetMember))) || 
    (await NotValidateRoleHierarchy(interaction, targetMember))
  )) || (
    targetUser &&
    (await NotValidateModerationTarget(interaction, targetUser.id))
  );
}