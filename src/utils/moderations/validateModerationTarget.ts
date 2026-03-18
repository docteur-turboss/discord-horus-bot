import { ChatInputCommandInteraction } from "discord.js";
import { reply } from "utils/discord/reply";

export async function NotValidateModerationTarget(
  interaction: ChatInputCommandInteraction,
  targetUserId: string
) {
  if(
    targetUserId !== interaction.guild!.ownerId && 
    targetUserId !== interaction.client.user.id
  ) return false;
  
  if (targetUserId === interaction.user.id) {
    reply(interaction, {
      key: "errors.self_action",
      ephemeral: true,
      type: "error"
    });
  } else {
    reply(interaction, {
      key: "errors.owner_action",
      ephemeral: true,
      type: "error"
    });
  }

  return true;
}