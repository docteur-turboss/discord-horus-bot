import { BaseGuildTextChannel, ChatInputCommandInteraction, Collection, GuildMember, Message, User } from "discord.js";
import { isUserBannedOrReply } from "utils/moderations/getBannedUser";
import { BaseCommandType } from "utils/commands/baseCommand.types";
import { TranslationKey } from "utils/locales/i18n.types";

export const setupAllReponseContext = (
  interaction: ChatInputCommandInteraction, 
  type: BaseCommandType,  
  targetMember: GuildMember | null, 
  targetUser: User | null, 
  targetChannel: BaseGuildTextChannel | null,
  vars : {
    guild: string;
    reason: string;
    user: string;
    nickname: string;
    moderator: string;
    duration: string;
    timeoutMs: number | null;
    channel: string | undefined;
    amount: number | null;
    deletableMessages: false | Collection<string, Message<boolean>>;
    userId: string | null;
}) => {
  let confirmKey: TranslationKey,
    successKey: TranslationKey,
    key: TranslationKey,
    confirmFunc,
    beforeConfirmFunc: Function | undefined;

  switch (type) {
    case "unmute":
      confirmKey = "moderation.unmute_confirm";
      successKey = "moderation.unmute_success";
      key = "moderation.unmute_dm";
      confirmFunc = async () => await targetMember?.timeout(null, vars.reason);

      break;
    case "purge-message":
      confirmKey = "moderation.purge_confirm";
      successKey = "moderation.purge_success";
      key = "cooldown.active";
      confirmFunc = async () => await targetChannel?.bulkDelete(vars.deletableMessages||0);
      
      break;
    case "rename-member":
      confirmKey = "moderation.rename_confirm";
      successKey = "moderation.rename_success";
      key = "moderation.rename_applied";
      confirmFunc = async () => await targetMember?.setNickname(vars.nickname);

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
      confirmFunc = async () => await targetMember?.timeout(vars.timeoutMs, vars.reason);

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
      key = "cooldown.active";
      confirmFunc = async () =>
        vars.userId && (await interaction.guild!.members.unban(vars.userId));

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

  return { confirmFunc, successKey, key, confirmKey, beforeConfirmFunc }
}