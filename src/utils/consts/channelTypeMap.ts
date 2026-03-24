import { ChannelType } from "discord.js";
import { TranslationKey } from "utils/locales/i18n.types";

export const CHANNEL_TYPE_MAP: Record<number, TranslationKey> = {
  [ChannelType.GuildText]: "channel.type.text",
  [ChannelType.GuildVoice]: "channel.type.voice",
  [ChannelType.GuildForum]: "channel.type.forum",
  [ChannelType.GuildAnnouncement]: "channel.type.announcement",
  [ChannelType.GuildStageVoice]: "channel.type.stage",
};