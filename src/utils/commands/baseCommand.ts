import { targetSend } from "utils/discord/reply";
import { BaseCommandType } from "./baseCommand.types";
import { ChatInputCommandInteraction } from "discord.js";
import { confirmAction } from "utils/discord/confirmAction";
import { validateContext } from "utils/discord/validateContext";
import { getMemberSafeOrReply } from "utils/discord/getMemberSafe";
import { getAllVariables } from "utils/validation/getAllVariables";
import { GlobalValidation } from "utils/validation/globalValidation";
import { getBannedUserOrReply } from "utils/moderations/getBannedUser";
import { setupAllReponseContext } from "utils/validation/setupAllReponseContext";
import { NotValidateUserIdOrReply } from "utils/validation/validateUserIdOrReply";
import { NotValidateTimestampOrReply } from "utils/validation/validateTimestampOrReply";

export const BaseCommand = async (
  interaction: ChatInputCommandInteraction,
  type: BaseCommandType,
) => {
  if (await validateContext(interaction, type)) return;

  const {
    targetUser, 
    duration, 
    nickname, 
    reason, 
    userId
  } = getAllVariables(interaction, type)

  if (userId && (await NotValidateUserIdOrReply(interaction, userId))) return;

  const bannedUser = await getBannedUserOrReply(interaction, userId ?? "");
  const targetMember = await getMemberSafeOrReply(interaction, targetUser?.id);
  if (!targetMember && !bannedUser) return;

  if(await GlobalValidation(interaction, targetMember, targetUser, type)) return;

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
    timeoutMs,
    userId
  };

  const {
    beforeConfirmFunc,
    confirmFunc, 
    successKey,
    confirmKey,
    key,
  } = setupAllReponseContext(interaction, type, targetMember, targetUser, vars);

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
