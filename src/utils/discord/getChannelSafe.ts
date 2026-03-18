import { ChatInputCommandInteraction, GuildBasedChannel } from "discord.js";
import { reply } from "./reply";

export async function getChannelSafeOrReply(
  interaction: ChatInputCommandInteraction,
  channelId?: string
): Promise<GuildBasedChannel | null> {
  if(!channelId) return null;
  const channel = await interaction.guild?.channels.fetch(channelId).catch(() => null);

  if(!channel) {
    reply(interaction, {
      key: "errors.channel_not_found",
      ephemeral: true,
      type: "error",
    });
    return null;
  }

  return channel;
}