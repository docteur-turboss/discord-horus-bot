import { ChatInputCommandInteraction } from "discord.js";
import { reply } from "utils/discord/reply";

export async function NotValidateTimestampOrReply(
  interaction: ChatInputCommandInteraction,
  timestamp: number
) {
  const MAX_TIMEOUT = 28 * 24 * 60 * 60 * 1000;

  if (!timestamp || timestamp < MAX_TIMEOUT) return false

  reply(interaction, {
    key: "errors.invalid_timestamp",
    ephemeral: true,
    type: "error",
  });
  return true;
}