import {
  ChannelType,
  TextChannel,
  VoiceChannel,
  ForumChannel,
} from "discord.js";
import { t } from "utils/locales/i18n";

export const buildChannelSpecificFields = (channel: any, lang: string) => {
  const fields = [];

  if (
    channel.type === ChannelType.GuildText ||
    channel.type === ChannelType.GuildAnnouncement
  ) {
    const c = channel as TextChannel;

    fields.push(
      {
        name: t(lang, "embeds.logs.fields.nsfw"),
        value: String(c.nsfw),
        inline: true,
      },
      {
        name: t(lang, "embeds.logs.fields.slowmode"),
        value: `\`${c.rateLimitPerUser}s\``,
        inline: true,
      }
    );
  }

  if (
    channel.type === ChannelType.GuildVoice ||
    channel.type === ChannelType.GuildStageVoice
  ) {
    const c = channel as VoiceChannel;

    fields.push(
      {
        name: t(lang, "embeds.logs.fields.bitrate"),
        value: `\`${c.bitrate}\``,
        inline: true,
      },
      {
        name: t(lang, "embeds.logs.fields.user_limit"),
        value: `\`${c.userLimit || 0}\``,
        inline: true,
      }
    );
  }

  if (channel.type === ChannelType.GuildForum) {
    const c = channel as ForumChannel;

    fields.push(
      {
        name: t(lang, "embeds.logs.fields.nsfw"),
        value: String(c.nsfw),
        inline: true,
      },
      {
        name: t(lang, "embeds.logs.fields.slowmode"),
        value: `\`${c.rateLimitPerUser}s\``,
        inline: true,
      }
    );
  }

  return fields;
};