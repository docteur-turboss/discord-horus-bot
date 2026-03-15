import { ChatInputCommandInteraction } from "discord.js";
import { reply } from "utils/discord/reply";

export async function validateModerationTarget(
  interaction: ChatInputCommandInteraction,
  targetUserId: string
) {
  if (targetUserId === interaction.user.id) {
    await reply(interaction, {
      key: "errors.self_action",
      ephemeral: true,
      type: "error"
    });
    return false;
  }

  if (targetUserId === interaction.guild!.ownerId) {
    await reply(interaction, {
      key: "errors.owner_action",
      ephemeral: true,
      type: "error"
    });
    return false;
  }

  return true;
}