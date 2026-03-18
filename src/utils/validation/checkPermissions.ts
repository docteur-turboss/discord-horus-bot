import { ChatInputCommandInteraction, GuildMember, PermissionFlagsBits } from "discord.js";
import { TranslationKey } from "utils/locales/i18n.types";

export type Permissions = keyof typeof PermissionFlagsBits;

// Mapping Permissions → PermissionFlagsBits + error keys for user and bot
const PERMISSION_MAP: Record<Permissions, { flag: bigint; userError: TranslationKey; botError: TranslationKey }> = {
  BanMembers: { flag: PermissionFlagsBits.BanMembers, userError: "errors.no_permission_ban", botError: "errors.bot_no_permission_ban" },
  KickMembers: { flag: PermissionFlagsBits.KickMembers, userError: "errors.no_permission_kick", botError: "errors.bot_no_permission_kick" },
  ModerateMembers: { flag: PermissionFlagsBits.ModerateMembers, userError: "errors.no_permission_timeout", botError: "errors.bot_no_permission_timeout" },
  ManageRoles: { flag: PermissionFlagsBits.ManageRoles, userError: "errors.no_permission_manage_roles", botError: "errors.bot_no_permission_manage_roles" },
  ManageChannels: { flag: PermissionFlagsBits.ManageChannels, userError: "errors.no_permission_manage_channels", botError: "errors.bot_no_permission_manage_channels" },
  ManageNicknames: { flag: PermissionFlagsBits.ManageNicknames, userError: "errors.no_permission_manage_nicknames", botError: "errors.bot_no_permission_manage_nicknames" },
  AddReactions: { flag: PermissionFlagsBits.AddReactions, userError: "errors.no_permission_add_reactions", botError: "errors.bot_no_permission_add_reactions" },
  ManageMessages: { flag: PermissionFlagsBits.ManageMessages, userError: "errors.no_permission_manage_messages", botError: "errors.bot_no_permission_manage_messages" },
  Administrator: { flag: PermissionFlagsBits.Administrator, userError: "errors.no_permission_administrator", botError: "errors.bot_no_permission_administrator" },
  AttachFiles: { flag: PermissionFlagsBits.AttachFiles, userError: "errors.no_permission_attach_files", botError: "errors.bot_no_permission_attach_files" },
  BypassSlowmode: { flag: PermissionFlagsBits.BypassSlowmode, userError: "errors.no_permission_bypass_slowmode", botError: "errors.bot_no_permission_bypass_slowmode" },
  ChangeNickname: { flag: PermissionFlagsBits.ChangeNickname, userError: "errors.no_permission_change_nickname", botError: "errors.bot_no_permission_change_nickname" },
  Connect: { flag: PermissionFlagsBits.Connect, userError: "errors.no_permission_connect", botError: "errors.bot_no_permission_connect" },
  CreateEvents: { flag: PermissionFlagsBits.CreateEvents, userError: "errors.no_permission_create_events", botError: "errors.bot_no_permission_create_events" },
  CreateGuildExpressions: { flag: PermissionFlagsBits.CreateGuildExpressions, userError: "errors.no_permission_create_guild_expressions", botError: "errors.bot_no_permission_create_guild_expressions" },
  CreateInstantInvite: { flag: PermissionFlagsBits.CreateInstantInvite, userError: "errors.no_permission_create_instant_invite", botError: "errors.bot_no_permission_create_instant_invite" },
  CreatePrivateThreads: { flag: PermissionFlagsBits.CreatePrivateThreads, userError: "errors.no_permission_create_private_threads", botError: "errors.bot_no_permission_create_private_threads" },
  CreatePublicThreads: { flag: PermissionFlagsBits.CreatePublicThreads, userError: "errors.no_permission_create_public_threads", botError: "errors.bot_no_permission_create_public_threads" },
  DeafenMembers: { flag: PermissionFlagsBits.DeafenMembers, userError: "errors.no_permission_deafen_members", botError: "errors.bot_no_permission_deafen_members" },
  EmbedLinks: { flag: PermissionFlagsBits.EmbedLinks, userError: "errors.no_permission_embed_links", botError: "errors.bot_no_permission_embed_links" },
  ViewAuditLog: { flag: PermissionFlagsBits.ViewAuditLog, userError: "errors.no_permission_view_audit_log", botError: "errors.bot_no_permission_view_audit_log" },
  ViewChannel: { flag: PermissionFlagsBits.ViewChannel, userError: "errors.no_permission_view_channel", botError: "errors.bot_no_permission_view_channel" },
  ManageEmojisAndStickers: { flag: PermissionFlagsBits.ManageEmojisAndStickers, userError: "errors.no_permission_manage_emojis_and_stickers", botError: "errors.bot_no_permission_manage_emojis_and_stickers" },
  ManageEvents: { flag: PermissionFlagsBits.ManageEvents, userError: "errors.no_permission_manage_events", botError: "errors.bot_no_permission_manage_events" },
  ManageGuild: { flag: PermissionFlagsBits.ManageGuild, userError: "errors.no_permission_manage_guild", botError: "errors.bot_no_permission_manage_guild" },
  ManageGuildExpressions: { flag: PermissionFlagsBits.ManageGuildExpressions, userError: "errors.no_permission_manage_guild_expressions", botError: "errors.bot_no_permission_manage_guild_expressions" },
  ManageThreads: { flag: PermissionFlagsBits.ManageThreads, userError: "errors.no_permission_manage_threads", botError: "errors.bot_no_permission_manage_threads" },
  ManageWebhooks: { flag: PermissionFlagsBits.ManageWebhooks, userError: "errors.no_permission_manage_webhooks", botError: "errors.bot_no_permission_manage_webhooks" },
  MentionEveryone: { flag: PermissionFlagsBits.MentionEveryone, userError: "errors.no_permission_mention_everyone", botError: "errors.bot_no_permission_mention_everyone" },
  MoveMembers: { flag: PermissionFlagsBits.MoveMembers, userError: "errors.no_permission_move_members", botError: "errors.bot_no_permission_move_members" },
  MuteMembers: { flag: PermissionFlagsBits.MuteMembers, userError: "errors.no_permission_mute_voice", botError: "errors.bot_no_permission_mute_voice" },
  PinMessages: { flag: PermissionFlagsBits.PinMessages, userError: "errors.no_permission_pin_messages", botError: "errors.bot_no_permission_pin_messages" },
  PrioritySpeaker: { flag: PermissionFlagsBits.PrioritySpeaker, userError: "errors.no_permission_priority_speaker", botError: "errors.bot_no_permission_priority_speaker" },
  ReadMessageHistory: { flag: PermissionFlagsBits.ReadMessageHistory, userError: "errors.no_permission_read_message_history", botError: "errors.bot_no_permission_read_message_history" },
  RequestToSpeak: { flag: PermissionFlagsBits.RequestToSpeak, userError: "errors.no_permission_request_to_speak", botError: "errors.bot_no_permission_request_to_speak" },
  SendMessages: { flag: PermissionFlagsBits.SendMessages, userError: "errors.no_permission_send_messages", botError: "errors.bot_no_permission_send_messages" },
  SendMessagesInThreads: { flag: PermissionFlagsBits.SendMessagesInThreads, userError: "errors.no_permission_send_messages_in_threads", botError: "errors.bot_no_permission_send_messages_in_threads" },
  SendPolls: { flag: PermissionFlagsBits.SendPolls, userError: "errors.no_permission_send_polls", botError: "errors.bot_no_permission_send_polls" },
  SendTTSMessages: { flag: PermissionFlagsBits.SendTTSMessages, userError: "errors.no_permission_send_tts_messages", botError: "errors.bot_no_permission_send_tts_messages" },
  SendVoiceMessages: { flag: PermissionFlagsBits.SendVoiceMessages, userError: "errors.no_permission_send_voice_messages", botError: "errors.bot_no_permission_send_voice_messages" },
  Speak: { flag: PermissionFlagsBits.Speak, userError: "errors.no_permission_speak", botError: "errors.bot_no_permission_speak" },
  Stream: { flag: PermissionFlagsBits.Stream, userError: "errors.no_permission_stream", botError: "errors.bot_no_permission_stream" },
  UseEmbeddedActivities: { flag: PermissionFlagsBits.UseEmbeddedActivities, userError: "errors.no_permission_use_embedded_activities", botError: "errors.bot_no_permission_use_embedded_activities" },
  UseApplicationCommands: { flag: PermissionFlagsBits.UseApplicationCommands, userError: "errors.no_permission_use_application_commands", botError: "errors.bot_no_permission_use_application_commands" },
  UseExternalApps: { flag: PermissionFlagsBits.UseExternalApps, userError: "errors.no_permission_use_external_apps", botError: "errors.bot_no_permission_use_external_apps" },
  UseExternalEmojis: { flag: PermissionFlagsBits.UseExternalEmojis, userError: "errors.no_permission_use_external_emojis", botError: "errors.bot_no_permission_use_external_emojis" },
  UseExternalSounds: { flag: PermissionFlagsBits.UseExternalSounds, userError: "errors.no_permission_use_external_sounds", botError: "errors.bot_no_permission_use_external_sounds" },
  UseExternalStickers: { flag: PermissionFlagsBits.UseExternalStickers, userError: "errors.no_permission_use_external_stickers", botError: "errors.bot_no_permission_use_external_stickers" },
  UseSoundboard: { flag: PermissionFlagsBits.UseSoundboard, userError: "errors.no_permission_use_soundboard", botError: "errors.bot_no_permission_use_soundboard" },
  UseVAD: { flag: PermissionFlagsBits.UseVAD, userError: "errors.no_permission_use_vad", botError: "errors.bot_no_permission_use_vad" },
  ViewCreatorMonetizationAnalytics: { flag: PermissionFlagsBits.ViewCreatorMonetizationAnalytics, userError: "errors.no_permission_view_creator_monetization_analytics", botError: "errors.bot_no_permission_view_creator_monetization_analytics" },
  ViewGuildInsights: { flag: PermissionFlagsBits.ViewGuildInsights, userError: "errors.no_permission_view_guild_insights", botError: "errors.bot_no_permission_view_guild_insights" },
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