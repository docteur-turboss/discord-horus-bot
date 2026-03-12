import { GuildMember, PermissionFlagsBits } from "discord.js";

/**
 * Checks if a member has the necessary permissions for moderation actions.
 * @params member The GuildMember to check.
 * @params botMember The bot's GuildMember, to also check its permissions.
 * @returns An object with boolean values for each action.
 */
export const checkPermissions = (
  member: GuildMember,
  botMember: GuildMember
) => {
  return {
    canBan: member.permissions.has(PermissionFlagsBits.BanMembers),
    botCanBan: botMember.permissions.has(PermissionFlagsBits.BanMembers),

    canKick: member.permissions.has(PermissionFlagsBits.KickMembers),
    botCanKick: botMember.permissions.has(PermissionFlagsBits.KickMembers),

    canMute: member.permissions.has(PermissionFlagsBits.ModerateMembers),
    botCanMute: botMember.permissions.has(PermissionFlagsBits.ModerateMembers),

    canManageRoles: member.permissions.has(PermissionFlagsBits.ManageRoles),
    botCanManageRoles: botMember.permissions.has(PermissionFlagsBits.ManageRoles),

    canManageChannels: member.permissions.has(PermissionFlagsBits.ManageChannels),
    botCanManageChannels: botMember.permissions.has(PermissionFlagsBits.ManageChannels),

    isAdmin: member.permissions.has(PermissionFlagsBits.Administrator),
    botIsAdmin: botMember.permissions.has(PermissionFlagsBits.Administrator),
  };
};