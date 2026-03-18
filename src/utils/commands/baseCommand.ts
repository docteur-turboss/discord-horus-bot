import { t } from "utils/locales/i18n";
import { targetSend } from "utils/discord/reply";
import { ChatInputCommandInteraction } from "discord.js";
import { confirmAction } from "utils/discord/confirmAction";
import { getMemberSafeOrReply } from "utils/discord/getMemberSafe";
import { ensureNotGuildInteraction } from "utils/discord/ensureGuildInteraction";
import { NotValidateUserIdOrReply } from "utils/validation/validateUserIdOrReply";
import { NotValidateRoleHierarchy } from "utils/moderations/validateRoleHierarchy";
import { NotValidateTimestampOrReply } from "utils/validation/validateTimestampOrReply";
import { NotValidateModerationTarget } from "utils/moderations/validateModerationTarget";
import {
  getBannedUserOrReply,
  isUserBannedOrReply,
} from "utils/moderations/getBannedUser";
import { NotValidateModerationKickable } from "utils/moderations/validateModerationKickable";
import { NotValidateModerationBannable } from "utils/moderations/validateModerationBannable";
import { NotValidateModerationManageable } from "utils/moderations/validateModerationManageable";
import { NotValidateModerationPermissions } from "utils/moderations/validateModerationPermissions";
import { NotValidateModerationModeratable } from "utils/moderations/validateModerationModeratable";
import {
  NotValidateModerationCommunicationDisabledOrReply,
  ValidateModerationCommunicationDisabledOrReply,
} from "utils/moderations/validateModerationCommunicationDisabled";

type BaseCommandType =
  | "ban"
  | "kick"
  | "mute"
  | "unban"
  | "unmute"
  | "rename-member"
  | "reset-member-nickname";

export const BaseCommand = async (
  interaction: ChatInputCommandInteraction,
  type: BaseCommandType,
) => {
  if (await ensureNotGuildInteraction(interaction)) return;
  if (
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
      (await NotValidateModerationPermissions(interaction, "KickMembers")))
  )
    return;

  const targetUser = !(type === "unban")
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

  if (userId && (await NotValidateUserIdOrReply(interaction, userId))) return;

  const bannedUser = await getBannedUserOrReply(interaction, userId ?? "");
  const targetMember = await getMemberSafeOrReply(interaction, targetUser?.id);
  if (!targetMember && !bannedUser) return;

  if (
    targetMember &&
    (((type === "unmute" || type === "mute") &&
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
        (await NotValidateModerationBannable(interaction, targetMember))))
  )
    return;
  if (
    targetUser &&
    (await NotValidateModerationTarget(interaction, targetUser.id))
  )
    return;
  if (
    targetMember &&
    (await NotValidateRoleHierarchy(interaction, targetMember))
  )
    return;

  const timeoutMs = !duration ? null : duration * 60 * 1000;

  if (timeoutMs && (await NotValidateTimestampOrReply(interaction, timeoutMs)))
    return;

  const vars = {
    guild: interaction.guild!.name,
    reason,
    user:
      type === "unban" ? (bannedUser?.user.tag ?? "") : (targetUser?.tag ?? ""),
    nickname: nickname ? nickname : "",
    moderator: interaction.user.displayName,
    duration: duration ? duration.toString() : "",
  };

  let confirmKey,
    successKey,
    key,
    confirmFunc,
    beforeConfirmFunc: Function | undefined;
  switch (type) {
    case "unmute":
      confirmKey = "moderation.unmute_confirm";
      successKey = "moderation.unmute_success";
      key = "moderation.unmute_dm";
      confirmFunc = async () => await targetMember?.timeout(null, reason);

      break;
    case "rename-member":
      confirmKey = "moderation.rename_confirm";
      successKey = "moderation.rename_success";
      key = "moderation.rename_applied";
      confirmFunc = async () => await targetMember?.setNickname(nickname);

      break;
    case "reset-member-nickname":
      confirmKey = "moderation.reset_nickname_confirm";
      successKey = "moderation.reset_nickname_success";
      key = "moderation.reset_nickname_applied";
      confirmFunc = async () => await targetMember?.setNickname(null);
      
      break;
    case "mute":
      confirmKey = "moderation.mute_confirm";
      successKey = "moderation.mute_success";
      key = "moderation.mute_dm";
      confirmFunc = async () => await targetMember?.timeout(timeoutMs, reason);

      break;
    case "ban":
      confirmKey = "moderation.ban_confirm";
      successKey = "moderation.ban_success";
      key = "moderation.ban_dm";
      confirmFunc = async () =>
        await targetMember?.ban({ reason: vars.reason });
      beforeConfirmFunc = async () => {
        if (await isUserBannedOrReply(interaction, targetUser?.id)) throw true;
      };

      break;
    case "unban":
      confirmKey = "moderation.unban_confirm";
      successKey = "moderation.unban_success";
      key = "";
      confirmFunc = async () =>
        userId && (await interaction.guild!.members.unban(userId));

      break;
    case "kick":
      confirmKey = "moderation.kick_confirm";
      successKey = "moderation.kick_success";
      key = "moderation.kick_dm";
      confirmFunc = async () => await targetMember?.kick(vars.reason);

      break;
    default:
      throw new Error("BaseCommand need to have a type");
  }

  await confirmAction(interaction, {
    confirmKey,
    successKey,
    vars,

    onConfirm: async () => {
      if (beforeConfirmFunc) await beforeConfirmFunc();

      if (type !== "unban" && targetMember)
        await targetSend(targetMember, interaction, {
          key,
          vars,
          type: "info",
        }).catch(() => null);

      await confirmFunc();
    },
  });
};
