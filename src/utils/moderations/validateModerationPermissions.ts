import { checkPermissions, Permissions } from "utils/validation/checkPermissions";
import { ChatInputCommandInteraction } from "discord.js";
import { reply } from "utils/discord/reply";

export async function NotValidateModerationPermissions(
  interaction: ChatInputCommandInteraction,
  permission: Permissions | Permissions[]
) {
  const permError = checkPermissions(interaction, permission);

  if (!permError) return false;
    
  reply(interaction, {
    key: permError,
    ephemeral: true,
    type: "error",
  });
  return true;
}