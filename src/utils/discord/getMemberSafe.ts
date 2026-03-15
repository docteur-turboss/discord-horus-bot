import { Guild, GuildMember } from "discord.js";

export async function getMemberSafe(
  guild: Guild,
  userId: string
): Promise<GuildMember | null> {
  try {
    return await guild.members.fetch(userId);
  } catch {
    return null;
  }
}