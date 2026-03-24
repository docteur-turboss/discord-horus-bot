import { 
  NonThreadGuildBasedChannel,
  AuditLogEvent,
  VoiceChannel,
  ForumChannel,
  ChannelType,
  TextChannel,
  DMChannel,
  Events,
} from "discord.js";
import { IC_ZeroWidthJoiner } from "utils/consts/invisiblesChars";
import { formatPerm } from "utils/helper/formatPerm";
import { logEmbed } from "utils/embeds/logEmbed";
import { logger } from "utils/logger/logger";
import { t } from "utils/locales/i18n";
import { CHANNEL_TYPE_MAP } from "utils/consts/channelTypeMap";

export const data = {
  event: Events.ChannelDelete,
};

export const main = async (
  channel: DMChannel | NonThreadGuildBasedChannel,
) => {
  if (!channel || channel.isDMBased() || !channel.guild) return;

  try {
    if(channel.partial) await channel.fetch().catch(() => null);
    const guild = channel.guild;

    const log = await guild.fetchAuditLogs({ 
      type: AuditLogEvent.ChannelDelete
    });
    if (!log) return;

    const entry = log.entries.first();
    if (!entry) return;

    const member = entry.executor;
    if (member?.partial) await member.fetch().catch(() => null);

    if (!member || member.bot) return;

    const logChannel = guild.channels.cache.find((ch) => {
      if (!ch.isTextBased()) return false;
      if (!("topic" in ch)) return false;

      return (ch as TextChannel).topic?.includes(IC_ZeroWidthJoiner);
    }) as TextChannel | undefined;
    if (!logChannel) return;

    const lang = guild.preferredLocale.split("-")[0];

    const permissions = channel.permissionOverwrites.cache
      .map(overwrite => {
        const allowed = overwrite.allow.toArray().map(p => formatPerm(p, lang));
        const denied = overwrite.deny.toArray().map(p => formatPerm(p, lang));

        return [
          allowed.length ? `+ ${allowed.join(", ")}` : null,
          denied.length ? `- ${denied.join(", ")}` : null,
        ].filter(Boolean).join("\n");
      })
      .filter(Boolean)
      .slice(0, 10)
      .join("\n\n") || "*none*";

    const fields = [
      {
        name: t(lang, "embeds.logs.fields.name"),
        value: `\`${channel.name}\``,
        inline: true,
      },
      {
        name: t(lang, "embeds.logs.fields.type"),
        value: t(lang, CHANNEL_TYPE_MAP[channel.type] ?? "channel.type.unknown"),
        inline: true,
      },
      {
        name: t(lang, "embeds.logs.fields.parent"),
        value: channel.parentId ? `<#${channel.parentId}>` : "*none*",
        inline: true,
      },
      {
        name: t(lang, "embeds.logs.fields.position"),
        value: `\`${channel.position}\``,
        inline: true,
      }
    ];

    if (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement) {
      const text = channel as TextChannel;

      fields.push(
        {
          name: t(lang, "embeds.logs.fields.nsfw"),
          value: `\`${text.nsfw}\``,
          inline: true,
        },
        {
          name: t(lang, "embeds.logs.fields.slowmode"),
          value: `\`${text.rateLimitPerUser}s\``,
          inline: true,
        }
      );
    }

    if (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice) {
      const voice = channel as VoiceChannel;

      fields.push(
        {
          name: t(lang, "embeds.logs.fields.bitrate"),
          value: `\`${voice.bitrate}\``,
          inline: true,
        },
        {
          name: t(lang, "embeds.logs.fields.user_limit"),
          value: `\`${voice.userLimit}\``,
          inline: true,
        }
      );
    }

    if (channel.type === ChannelType.GuildForum) {
      const forum = channel as ForumChannel;

      fields.push(
        {
          name: t(lang, "embeds.logs.fields.nsfw"),
          value: `\`${forum.nsfw}\``,
          inline: true,
        },
        {
          name: t(lang, "embeds.logs.fields.slowmode"),
          value: `\`${forum.rateLimitPerUser}s\``,
          inline: true,
        }
      );
    }

    fields.push({
      name: t(lang, "embeds.logs.fields.permissions"),
      value: permissions,
      inline: false,
    });

    // Executor
    fields.push({
      name: t(lang, "embeds.logs.fields.user.responsable"),
      value: `<@${member.id}>`,
      inline: false,
    });

    const embed = logEmbed({
      type: "channels",
      lang,
      description: t(lang, "embeds.logs.channels.delete.description"),
      fields,
    });

    await logChannel.send({
      embeds: [embed],
    });

  } catch (error) {
    logger.error("Error in channel delete events listener", error as Record<string, unknown>);
  }
};