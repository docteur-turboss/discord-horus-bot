import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { reply } from "utils/discord/reply";

export async function NotValidateModerationKickable(
  interaction: ChatInputCommandInteraction,
  targetUser: GuildMember
) {
  if (targetUser.kickable) return false;
  
  reply(interaction, {
      key: "errors.not_kickable",
      ephemeral: true,
      type: "error"
  });
  return true;
}