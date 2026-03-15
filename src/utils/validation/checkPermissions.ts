import { ChatInputCommandInteraction, GuildMember, PermissionFlagsBits } from "discord.js";

export type Permissions = "ban" | "kick" | "mute" | "manageRoles" | "manageChannels";

// Mapping Permissions → PermissionFlagsBits + error keys for user and bot
const PERMISSION_MAP: Record<Permissions, { flag: bigint; userError: string; botError: string }> = {
  ban: { flag: PermissionFlagsBits.BanMembers, userError: "errors.no_permission_ban", botError: "errors.bot_no_permission_ban" },
  kick: { flag: PermissionFlagsBits.KickMembers, userError: "errors.no_permission_kick", botError: "errors.bot_no_permission_kick" },
  mute: { flag: PermissionFlagsBits.ModerateMembers, userError: "errors.no_permission_mute", botError: "errors.bot_no_permission_mute" },
  manageRoles: { flag: PermissionFlagsBits.ManageRoles, userError: "errors.no_permission_manage_roles", botError: "errors.bot_no_permission_manage_roles" },
  manageChannels: { flag: PermissionFlagsBits.ManageChannels, userError: "errors.no_permission_manage_channels", botError: "errors.bot_no_permission_manage_channels" },
};

/**
 * Checks if a member has the necessary permissions for moderation actions.
 * @params member The GuildMember to check.
 * @params botMember The bot's GuildMember, to also check its permissions.
 * @returns An object with boolean values for each action.
 */
export const checkPermissions = (
  interaction: ChatInputCommandInteraction,
  permissions: Permissions | Permissions[]
) => {
  const member = interaction.member as GuildMember;
  const botMember = interaction.guild?.members.me as GuildMember;

  if (!member || !botMember) return "errors.command_execution";

  const perms = Array.isArray(permissions) ? permissions : [permissions];
  for (const perm of perms) {
    const { flag, userError, botError } = PERMISSION_MAP[perm];

    if (!member.permissions.has(flag)) return userError;
    if (!botMember.permissions.has(flag)) return botError;
  }

  return null;
};