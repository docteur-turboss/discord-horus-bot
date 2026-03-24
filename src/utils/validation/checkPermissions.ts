import { ChatInputCommandInteraction, GuildMember, PermissionFlagsBits } from "discord.js";
import { PERMISSION_MAP } from "utils/consts/permissionMap";
import { TranslationKey } from "utils/locales/i18n.types";

export type Permissions = keyof typeof PermissionFlagsBits;

/**
 * Checks if a member has the necessary permissions for moderation actions.
 * @params member The GuildMember to check.
 * @params botMember The bot's GuildMember, to also check its permissions.
 * @returns An object with boolean values for each action.
 */
export const checkPermissions = (
  interaction: ChatInputCommandInteraction,
  permissions: Permissions | Permissions[]
): null|TranslationKey => {
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