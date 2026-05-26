import { DiscordAPIError, Events, GuildMember } from "discord.js";
import { logger } from "utils/logger/logger";
import { autoRoleManager } from "utils/discord/autoRoleManager";

export const data = {
  event: Events.GuildMemberAdd,
};

export const main = async (member: GuildMember) => {
  if (!member.guild || member.user.bot) return;

  try {
    const roleId = autoRoleManager.getAutoRole(member.guild.id);
    if (!roleId) return;

    if (member.roles.cache.has(roleId)) return;

    const botMember = member.guild.members.me;
    if (!botMember) return;

    const role = member.guild.roles.cache.get(roleId);
    if (!role) return;

    if (botMember.roles.highest.position <= role.position) return;

    if (!botMember.permissions.has("ManageRoles")) return;

    await member.roles.add(roleId);
    logger.info(`Auto-role added to ${member.user.tag} in guild ${member.guild.id}: role ${roleId}`);
  } catch (error) {
    if (error instanceof DiscordAPIError && error.code === 50013) {
      logger.warn(`Auto-role failed in guild ${member.guild.id}: missing permissions for role`);
      return;
    }
    logger.error(`Auto-role error for ${member.user.tag} in guild ${member.guild.id}`, error as Record<string, unknown>);
  }
};
