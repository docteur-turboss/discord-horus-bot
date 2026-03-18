import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { reply } from "utils/discord/reply";

export async function NotValidateModerationModeratable(
  interaction: ChatInputCommandInteraction,
  targetUser: GuildMember
) {
  if (targetUser.moderatable) return false;
  
  reply(interaction, {
      key: "errors.not_moderatable",
      ephemeral: true,
      type: "error"
  });
  return true;
}