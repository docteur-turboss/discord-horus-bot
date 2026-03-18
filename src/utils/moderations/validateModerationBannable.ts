import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { reply } from "utils/discord/reply";

export async function NotValidateModerationBannable(
  interaction: ChatInputCommandInteraction,
  targetUser: GuildMember
) {
  if (targetUser.bannable) return false;
  
  reply(interaction, {
      key: "errors.not_bannable",
      ephemeral: true,
      type: "error"
  });
  return true;
}