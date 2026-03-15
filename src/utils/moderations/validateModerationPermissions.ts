import { checkPermissions, Permissions } from "utils/validation/checkPermissions";
import { ChatInputCommandInteraction } from "discord.js";
import { reply } from "utils/discord/reply";

export async function validateModerationPermissions(
  interaction: ChatInputCommandInteraction,
  permission: Permissions | Permissions[]
) {
  const permError = checkPermissions(interaction, permission);

  if (permError) {
    await reply(interaction, {
      key: permError,
      ephemeral: true,
      type: "error",
    });

    return false;
  }

  return true;
}