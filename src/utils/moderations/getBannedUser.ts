import { ChatInputCommandInteraction, GuildBan, Guild } from "discord.js";
import { reply } from "utils/discord/reply";

export async function getBannedUserOrReply(
  interaction: ChatInputCommandInteraction,
  userId: string
): Promise<GuildBan | null> {

  const bannedUser = (await interaction.guild!.bans.fetch()).get(userId);

  if (!bannedUser) {
    await reply(interaction, {
      key: "errors.user_not_banned",
      ephemeral: true,
      type: "error",
    });

    return null;
  }

  return bannedUser;
}

export async function isUserBanned(guild: Guild, userId: string) {
  const bans = await guild.bans.fetch();
  return bans.has(userId);
}