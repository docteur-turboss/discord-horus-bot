import { ChannelType, Events, MessageFlags, PermissionFlagsBits, VoiceState, TextChannel } from "discord.js";
import { tmpVoiceManager } from "utils/discord/tmpVoiceManager";
import { logger } from "utils/logger/logger";
import { buildTmpVoiceContainer } from "utils/embeds/tmpVoiceDashboard";
import { getTmpVoiceTrackedTopic } from "utils/consts/tmpVoiceTypes";

const findTextChannel = (voiceChannelId: string, guild: any): TextChannel | undefined => {
  const storedId = tmpVoiceManager.getTextChannel(voiceChannelId);
  if (storedId) {
    const ch = guild.channels.cache.get(storedId);
    if (ch?.type === ChannelType.GuildText) return ch as TextChannel;
  }
  const voiceCh = guild.channels.cache.get(voiceChannelId);
  if (!voiceCh?.parentId) return;
  return guild.channels.cache.find(
    (ch: any) => ch.type === ChannelType.GuildText && ch.name.endsWith("-voice") && ch.parentId === voiceCh.parentId
  ) as TextChannel | undefined;
};

export const data = {
  event: Events.VoiceStateUpdate,
};

export const main = async (oldState: VoiceState, newState: VoiceState) => {
  if (!newState.guild) return;
  if (newState.member?.user?.bot) return;

  const guild = newState.guild;
  const member = newState.member;
  if (!member) return;

  const joinedChannel = newState.channel;
  const leftChannel = oldState.channel;

  if (joinedChannel && tmpVoiceManager.isTracked(joinedChannel.id)) {
    const existingChannel = tmpVoiceManager.findOwnedChannel(guild, member.id);

    if (existingChannel) {
      await member.voice.setChannel(existingChannel).catch(() => null);
      return;
    }

    const category = joinedChannel.parent ?? null;
    const userName = member.displayName.replace(/[^a-zA-Z0-9_ -]/g, "");

    try {
      const newVoiceChannel = await guild.channels.create({
        name: `${userName}'s channel`,
        type: ChannelType.GuildVoice,
        parent: category?.id ?? undefined,
        permissionOverwrites: [
          {
            id: guild.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
          },
          {
            id: member.id,
            allow: [
              PermissionFlagsBits.ManageChannels,
              PermissionFlagsBits.MuteMembers,
              PermissionFlagsBits.DeafenMembers,
              PermissionFlagsBits.MoveMembers,
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.Connect,
            ],
          },
        ],
      });

      tmpVoiceManager.setOwner(newVoiceChannel.id, member.id);

      const textChannel = await guild.channels.create({
        name: `${userName}-voice`,
        type: ChannelType.GuildText,
        parent: category?.id ?? undefined,
        topic: getTmpVoiceTrackedTopic(newVoiceChannel.id),
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: member.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ManageMessages,
            ],
          },
        ],
      });

      tmpVoiceManager.setTextChannel(newVoiceChannel.id, textChannel.id);

      await member.voice.setChannel(newVoiceChannel).catch(() => null);

      const lang = guild.preferredLocale.split("-")[0];
      const container = await buildTmpVoiceContainer(newVoiceChannel, lang);

      await textChannel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (error) {
      logger.error("Failed to create temporary voice channel", error as Record<string, unknown>);
    }
    return;
  }

  if (joinedChannel && tmpVoiceManager.isOwnedVoiceChannel(joinedChannel.id)) {
    const textCh = findTextChannel(joinedChannel.id, guild);
    if (textCh) {
      await textCh.permissionOverwrites.create(member.id, {
        ViewChannel: true,
        ReadMessageHistory: true,
        SendMessages: true,
      }).catch(() => null);
    }
  }

  if (leftChannel && tmpVoiceManager.isOwnedVoiceChannel(leftChannel.id)) {
    const textCh = findTextChannel(leftChannel.id, guild);
    if (textCh) {
      await textCh.permissionOverwrites.delete(member.id).catch(() => null);
    }

    if (leftChannel.members.size === 0) {
      const storedTextId = tmpVoiceManager.getTextChannel(leftChannel.id);
      tmpVoiceManager.removeOwner(leftChannel.id);
      tmpVoiceManager.removeTextChannel(leftChannel.id);

      if (storedTextId) {
        const tx = guild.channels.cache.get(storedTextId);
        if (tx) tx.delete().catch(() => null);
      }

      leftChannel.delete().catch(() => null);
    } else {
      const ownerId = tmpVoiceManager.getOwnerByChannel(leftChannel.id);
      if (ownerId === member.id && !leftChannel.members.has(ownerId)) {
        tmpVoiceManager.removeOwner(leftChannel.id);
      }
    }
  }
};
