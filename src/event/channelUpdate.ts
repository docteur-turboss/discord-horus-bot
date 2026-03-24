import { 
  NonThreadGuildBasedChannel,
  AuditLogEvent,
  VoiceChannel,
  ForumChannel,
  ChannelType,
  TextChannel,
  DMChannel,
  Events,
  GuildChannel,
} from "discord.js";
import { IC_ZeroWidthJoiner } from "utils/consts/invisiblesChars";
import { formatPerm } from "utils/helper/formatPerm";
import { logEmbed } from "utils/embeds/logEmbed";
import { logger } from "utils/logger/logger";
import { t } from "utils/locales/i18n";
import { CHANNEL_TYPE_MAP } from "utils/consts/channelTypeMap";

export const data = {
  event: Events.ChannelUpdate,
};

export const main = async (
  oldChannel: DMChannel | NonThreadGuildBasedChannel, 
  newChannel: DMChannel | NonThreadGuildBasedChannel
) => {
  if (!oldChannel || !newChannel || oldChannel.isDMBased() || newChannel.isDMBased() || !newChannel.guild) return;

  try {
    if(oldChannel.partial) await oldChannel.fetch().catch(() => null);
    if(newChannel.partial) await newChannel.fetch().catch(() => null);
    const guild = newChannel.guild;

    const log = await guild.fetchAuditLogs({ 
      type: AuditLogEvent.ChannelUpdate
    })
    if(!log) return;

    const firstLogEntries = log.entries.first();
    if(!firstLogEntries) return;

    const member = firstLogEntries.executor;
    if(member?.partial) await member.fetch().catch(() => null);
    
    if (!member || member.bot) return;

    const logChannel = guild.channels.cache.find((channel) => {
      if (!channel.isTextBased()) return false;
      if (!("topic" in channel)) return false;

      const textChannel = channel as TextChannel;
      return textChannel.topic?.includes(IC_ZeroWidthJoiner);
    }) as TextChannel | undefined;
    if (!logChannel) return;

    const lang = guild.preferredLocale.split("-")[0];

    const fields = [];

    if (oldChannel.name !== newChannel.name) {
      fields.push({
        name: t(lang, "embeds.logs.fields.name.update"),
        value: `\`${oldChannel.name}\` → \`${newChannel.name}\``,
        inline: false,
      });
    }

    if (oldChannel.parentId !== newChannel.parentId) {
      fields.push({
        name: t(lang, "embeds.logs.fields.parent"),
        value: `${oldChannel.parentId ? `<#${oldChannel.parentId}>` : "*none*"} → ${newChannel.parentId ? `<#${newChannel.parentId}>` : "*none*"}`,
        inline: true,
      });
    }

    if (oldChannel.position !== newChannel.position) {
      fields.push({
        name: t(lang, "embeds.logs.fields.position.update"),
        value: `\`${oldChannel.position}\` → \`${newChannel.position}\``,
        inline: true,
      });
    }

    if (oldChannel.type !== newChannel.type) {
      fields.push({
        name: t(lang, "embeds.logs.fields.type"),
        value: `${t(lang, CHANNEL_TYPE_MAP[oldChannel.type] ?? "channel.type.unknown")} → ${t(lang, CHANNEL_TYPE_MAP[newChannel.type] ?? "channel.type.unknown")}`,
        inline: true,
      });
    }

    if (
      (newChannel.type === ChannelType.GuildText || newChannel.type === ChannelType.GuildAnnouncement) &&
      oldChannel.type === newChannel.type
    ) {
      const oldText = oldChannel as TextChannel;
      const newText = newChannel as TextChannel;

      if (oldText.nsfw !== newText.nsfw) {
        fields.push({
          name: t(lang, "embeds.logs.fields.nsfw"),
          value: `\`${oldText.nsfw}\` → \`${newText.nsfw}\``,
          inline: true,
        });
      }

      if (oldText.rateLimitPerUser !== newText.rateLimitPerUser) {
        fields.push({
          name: t(lang, "embeds.logs.fields.slowmode"),
          value: `\`${oldText.rateLimitPerUser}s\` → \`${newText.rateLimitPerUser}s\``,
          inline: true,
        });
      }
    }

    if (
      (newChannel.type === ChannelType.GuildVoice || newChannel.type === ChannelType.GuildStageVoice) &&
      oldChannel.type === newChannel.type
    ) {
      const oldVoice = oldChannel as VoiceChannel;
      const newVoice = newChannel as VoiceChannel;

      if (oldVoice.bitrate !== newVoice.bitrate) {
        fields.push({
          name: t(lang, "embeds.logs.fields.bitrate"),
          value: `\`${oldVoice.bitrate}\` → \`${newVoice.bitrate}\``,
          inline: true,
        });
      }

      if (oldVoice.userLimit !== newVoice.userLimit) {
        fields.push({
          name: t(lang, "embeds.logs.fields.user_limit"),
          value: `\`${oldVoice.userLimit}\` → \`${newVoice.userLimit}\``,
          inline: true,
        });
      }
    }

    if (
      newChannel.type === ChannelType.GuildForum &&
      oldChannel.type === ChannelType.GuildForum
    ) {
      const oldForum = oldChannel as ForumChannel;
      const newForum = newChannel as ForumChannel;

      if (oldForum.nsfw !== newForum.nsfw) {
        fields.push({
          name: t(lang, "embeds.logs.fields.nsfw"),
          value: `\`${oldForum.nsfw}\` → \`${newForum.nsfw}\``,
          inline: true,
        });
      }

      if (oldForum.rateLimitPerUser !== newForum.rateLimitPerUser) {
        fields.push({
          name: t(lang, "embeds.logs.fields.slowmode"),
          value: `\`${oldForum.rateLimitPerUser}s\` → \`${newForum.rateLimitPerUser}s\``,
          inline: true,
        });
      }
    }

    if (
      oldChannel.permissionOverwrites.cache.size !== newChannel.permissionOverwrites.cache.size ||
      !oldChannel.permissionOverwrites.cache.every((o, id) => {
        const n = newChannel.permissionOverwrites.cache.get(id);
        return n && o.allow.bitfield === n.allow.bitfield && o.deny.bitfield === n.deny.bitfield;
      })
    ) {
      const format = (channel: NonThreadGuildBasedChannel) =>
        channel.permissionOverwrites.cache
          .map(o => {
            const allowed = o.allow.toArray().map(p => formatPerm(p, lang));
            const denied = o.deny.toArray().map(p => formatPerm(p, lang));

            return [
              allowed.length ? `+ ${allowed.join(", ")}` : null,
              denied.length ? `- ${denied.join(", ")}` : null,
            ].filter(Boolean).join("\n");
          })
          .filter(Boolean)
          .slice(0, 5)
          .join("\n\n") || "*none*";

      fields.push({
        name: t(lang, "embeds.logs.fields.permissions.update"),
        value: `${t(lang, "embeds.logs.fields.before")}\n${format(oldChannel)}\n\n${t(lang, "embeds.logs.fields.after")}\n${format(newChannel)}`,
        inline: false,
      });
    }

    if (fields.length === 0) return;

    fields.push({
      name: t(lang, "embeds.logs.fields.user.responsable"),
      value: `<@${member.id}>`,
    });

    const embeds = logEmbed({
      type: "roles",
      lang,
      description: t(lang, "embeds.logs.roles.update.description"),
      fields
    });

    logChannel.send({
      embeds: [embeds]
    });
  } catch (error) {
    logger.error("Error in channel update events listener", error as Record<string, unknown>);
  }
};