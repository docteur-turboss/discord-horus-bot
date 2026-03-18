import { ChatInputCommandInteraction, GuildBasedChannel } from "discord.js";
import { reply } from "utils/discord/reply";

export async function NotValidateTextChannel(
  interaction: ChatInputCommandInteraction,
  target: GuildBasedChannel
) {
  if (target.isTextBased()) return false;
  
  reply(interaction, {
      key: "errors.not_a_text_channel",
      ephemeral: true,
      type: "error"
  });
  return true;
}