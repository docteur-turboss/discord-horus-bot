import { ChatInputCommandInteraction, Collection, Message } from "discord.js";
import { reply } from "utils/discord/reply";

export async function NotValidatBulkDeleteMessageOrReply(
  interaction: ChatInputCommandInteraction,
  deletableMessages: Collection<string, Message<boolean>>
) {
  if (deletableMessages.size) return false

  reply(interaction, {
    key: "errors.invalid_bulk_delete_timestamp",
    ephemeral: true,
    type: "error",
  });
  return true;
}