import { ChatInputCommandInteraction } from "discord.js";
import { validateUserId } from "./validUserId";
import { reply } from "utils/discord/reply";

export async function NotValidateUserIdOrReply(
  interaction: ChatInputCommandInteraction,
  userId: string
) {
  if(validateUserId(userId)) return false;
  
  reply(interaction, {
    key: "errors.invalid_user_id",
    ephemeral: true,
    type: "error",
  });
  return true;
}