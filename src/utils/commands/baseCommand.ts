import { targetSend } from "utils/discord/reply";
import { BaseCommandType } from "./baseCommand.types";
import { confirmAction } from "utils/discord/confirmAction";
import { validateContext } from "utils/discord/validateContext";
import { getMemberSafeOrReply } from "utils/discord/getMemberSafe";
import { getAllVariables } from "utils/validation/getAllVariables";
import { getChannelSafeOrReply } from "utils/discord/getChannelSafe";
import { GlobalValidation } from "utils/validation/globalValidation";
import { getBannedUserOrReply } from "utils/moderations/getBannedUser";
import { BaseGuildTextChannel, ChatInputCommandInteraction } from "discord.js";
import { setupAllReponseContext } from "utils/validation/setupAllReponseContext";
import { NotValidateUserIdOrReply } from "utils/validation/validateUserIdOrReply";
import { NotValidateTimestampOrReply } from "utils/validation/validateTimestampOrReply";
import { NotValidatBulkDeleteMessageOrReply } from "utils/validation/validateBulkDeleteMessageOrReply";

export const BaseCommand = async (
  interaction: ChatInputCommandInteraction,
  type: BaseCommandType,
) => {
  if (await validateContext(interaction, type)) return;

  const {
    targetChannel,
    amountMessage,
    targetUser, 
    duration, 
    nickname, 
    reason, 
    userId
  } = getAllVariables(interaction, type)

  if (userId && (await NotValidateUserIdOrReply(interaction, userId))) return;

  const bannedUser = await getBannedUserOrReply(interaction, userId ?? "");
  const targetMember = await getMemberSafeOrReply(interaction, targetUser?.id);
  const targetGuildChannel = await getChannelSafeOrReply(interaction, targetChannel?.id);
  if (!targetMember && !bannedUser && !targetGuildChannel) return;

  if(await GlobalValidation(interaction, targetMember, targetUser, targetGuildChannel, type)) return;

  const messages = type === "purge-message" && await (targetGuildChannel as BaseGuildTextChannel)?.messages.fetch({ limit: amountMessage??0 });
  const deletableMessages = messages && messages.filter(
    (msg) => Date.now() - msg.createdTimestamp <= 14 * 24 * 60 * 60 * 1000
  );
  if(messages && deletableMessages && (await NotValidatBulkDeleteMessageOrReply(interaction, deletableMessages))) return;
    
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
    channel: targetGuildChannel?.name,
    amount: amountMessage,
    deletableMessages,
    userId
  };

  const {
    beforeConfirmFunc,
    confirmFunc, 
    successKey,
    confirmKey,
    logFunc,
    key,
  } = setupAllReponseContext(interaction, type, targetMember, targetUser, targetGuildChannel as BaseGuildTextChannel, vars);

  await confirmAction(interaction, {
    confirmKey,
    successKey,
    vars,

    onConfirm: async () => {
      if (beforeConfirmFunc) await beforeConfirmFunc();

      if (type !== "unban" && type !== "purge-message" && targetMember)
        await targetSend(targetMember, interaction, {
          key,
          vars,
          type: "info",
        }).catch(() => null);

      await confirmFunc();
      await logFunc();
    },
  });
};
