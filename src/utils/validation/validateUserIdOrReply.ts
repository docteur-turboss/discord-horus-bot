import { ChatInputCommandInteraction } from "discord.js";
import { validateUserId } from "./validUserId";
import { reply } from "utils/discord/reply";

export async function validateUserIdOrReply(
  interaction: ChatInputCommandInteraction,
  userId: string
) {
  if (!validateUserId(userId)) {
    await reply(interaction, {
      key: "errors.invalid_user_id",
      ephemeral: true,
      type: "error",
    });

    return false;
  }

  return true;
}