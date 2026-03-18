import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { reply } from "utils/discord/reply";

export async function NotValidateModerationManageable(
  interaction: ChatInputCommandInteraction,
  targetUser: GuildMember
) {
  if (targetUser.manageable) return false;
  
  reply(interaction, {
      key: "errors.not_manageable",
      ephemeral: true,
      type: "error"
  });
  return true;
}