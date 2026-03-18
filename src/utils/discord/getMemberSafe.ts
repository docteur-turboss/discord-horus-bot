import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { reply } from "./reply";

export async function getMemberSafeOrReply(
  interaction: ChatInputCommandInteraction,
  userId?: string
): Promise<GuildMember | null> {
  if(!userId) return null;
  const user = await interaction.guild?.members.fetch(userId).catch(() => null);

  if(!user) {
    reply(interaction, {
      key: "errors.user_not_found",
      ephemeral: true,
      type: "error",
    });
    return null;
  }

  return user;
}