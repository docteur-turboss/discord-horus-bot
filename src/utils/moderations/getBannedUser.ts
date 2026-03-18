import { ChatInputCommandInteraction, GuildBan } from "discord.js";
import { reply } from "utils/discord/reply";

export async function getBannedUserOrReply(
  interaction: ChatInputCommandInteraction,
  userId?: string
): Promise<GuildBan | null> {
  return checkBan(interaction, "validate", userId)
}

export async function isUserBannedOrReply(
  interaction: ChatInputCommandInteraction, 
  userId?: string
) {
  return checkBan(interaction, "not_validate", userId);
}

async function checkBan(
  interaction: ChatInputCommandInteraction,
  type: "validate" | "not_validate",
  userId?: string,
) {
  if(!userId) return null;
  
  const bans = await interaction.guild!.bans.fetch();
  if (
    (type === "validate" && bans.has(userId)) ||
    (type === "not_validate" && !bans.has(userId))
  ) return null;
  
  reply(interaction, {
      key: type === "validate" ? "errors.user_not_banned" : "errors.already_banned",
      ephemeral: true,
      type: "error"
  });
  return bans.get(userId) || null;
}