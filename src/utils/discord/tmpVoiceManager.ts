import { ChannelType, Client, Collection, Guild, GuildMember, PermissionFlagsBits, TextChannel, VoiceChannel, Webhook } from "discord.js";
import { TMP_VOICE_WEBHOOK_NAME, TMP_VOICE_TOPIC_MARKER, getTmpVoiceTrackedTopic } from "utils/consts/tmpVoiceTypes";
import { logger } from "utils/logger/logger";

type TmpVoiceData = {
  trackedChannelId: string;
  guildId: string;
  webhookId: string;
};

class TmpVoiceManager {
  private trackedChannels: Collection<string, TmpVoiceData>;
  private voiceOwners: Collection<string, string>;
  private voiceTextChannels: Collection<string, string>;

  constructor() {
    this.trackedChannels = new Collection();
    this.voiceOwners = new Collection();
    this.voiceTextChannels = new Collection();
  }

  getTrackedChannels(guildId: string): string[] {
    return this.trackedChannels
      .filter((d) => d.guildId === guildId)
      .map((d) => d.trackedChannelId);
  }

  isTracked(channelId: string): boolean {
    return this.trackedChannels.has(channelId);
  }

  getTrackedData(channelId: string): TmpVoiceData | undefined {
    return this.trackedChannels.get(channelId);
  }

  addTracked(data: TmpVoiceData) {
    this.trackedChannels.set(data.trackedChannelId, data);
  }

  removeTracked(channelId: string) {
    this.trackedChannels.delete(channelId);
  }

  getOwner(voiceChannelId: string): string | undefined {
    return this.voiceOwners.get(voiceChannelId);
  }

  setOwner(voiceChannelId: string, userId: string) {
    this.voiceOwners.set(voiceChannelId, userId);
  }

  removeOwner(voiceChannelId: string) {
    this.voiceOwners.delete(voiceChannelId);
  }

  findOwnedChannel(guild: Guild, userId: string): VoiceChannel | undefined {
    for (const [channelId, ownerId] of this.voiceOwners) {
      if (ownerId !== userId) continue;
      const channel = guild.channels.cache.get(channelId);
      if (channel?.type === ChannelType.GuildVoice) return channel as VoiceChannel;
    }
    return undefined;
  }

  getOwnerByChannel(channelId: string): string | undefined {
    return this.voiceOwners.get(channelId);
  }

  async findBotWebhook(channel: VoiceChannel): Promise<Webhook | null> {
    try {
      const webhooks = await channel.fetchWebhooks();
      return webhooks.find((w) => w.name === TMP_VOICE_WEBHOOK_NAME && w.owner?.id === channel.client.user?.id) ?? null;
    } catch {
      return null;
    }
  }

  async ensureWebhook(channel: VoiceChannel): Promise<Webhook | null> {
    const existing = await this.findBotWebhook(channel);
    if (existing) return existing;

    try {
      return channel.createWebhook({
        name: TMP_VOICE_WEBHOOK_NAME,
      });
    } catch (error) {
      logger.error("Failed to create webhook for tmp voice tracking", error as Record<string, unknown>);
      return null;
    }
  }

  isVoiceOwner(member: GuildMember, channel: VoiceChannel): boolean {
    const ownerId = this.voiceOwners.get(channel.id);
    return ownerId === member.id;
  }

  findUserOwnedChannel(member: GuildMember): VoiceChannel | undefined {
    for (const [channelId, ownerId] of this.voiceOwners) {
      if (ownerId !== member.id) continue;
      const channel = member.guild.channels.cache.get(channelId);
      if (channel?.type === ChannelType.GuildVoice) return channel as VoiceChannel;
    }
    return undefined;
  }

  setTextChannel(voiceChannelId: string, textChannelId: string) {
    this.voiceTextChannels.set(voiceChannelId, textChannelId);
  }

  getTextChannel(voiceChannelId: string): string | undefined {
    return this.voiceTextChannels.get(voiceChannelId);
  }

  removeTextChannel(voiceChannelId: string) {
    this.voiceTextChannels.delete(voiceChannelId);
  }

  findTextChannelByVoice(voiceChannelId: string, guild: Guild) {
    const textId = this.voiceTextChannels.get(voiceChannelId);
    if (textId) return guild.channels.cache.get(textId);
    return guild.channels.cache.find(
      (ch) => ch.type === ChannelType.GuildText && ch.name.endsWith("-voice") && ch.parentId === guild.channels.cache.get(voiceChannelId)?.parentId
    );
  }

  isOwnedVoiceChannel(channelId: string): boolean {
    return this.voiceOwners.has(channelId) || !!this.voiceTextChannels.has(channelId);
  }

  getVoiceIdByTextChannel(textChannelId: string): string | undefined {
    for (const [voiceId, textId] of this.voiceTextChannels) {
      if (textId === textChannelId) return voiceId;
    }
    return undefined;
  }

  hasAnyOwner(voiceChannelId: string): boolean {
    return this.voiceOwners.has(voiceChannelId);
  }

  getVoiceOwnersEntries(): IterableIterator<[string, string]> {
    return this.voiceOwners.entries();
  }

  async scanGuildWebhooks(client: Client) {
    for (const guild of client.guilds.cache.values()) {
      try {
        const channels = guild.channels.cache.filter(
          (ch): ch is VoiceChannel => ch.type === ChannelType.GuildVoice
        );

        for (const channel of channels.values()) {
          const webhook = await this.findBotWebhook(channel);
          if (webhook) {
            this.trackedChannels.set(channel.id, {
              trackedChannelId: channel.id,
              guildId: guild.id,
              webhookId: webhook.id,
            });
          }
        }
      } catch (error) {
        logger.error(`Failed to scan guild ${guild.id} for tmp voice webhooks`, error as Record<string, unknown>);
      }
    }

    logger.info(`TmpVoiceManager: Found ${this.trackedChannels.size} tracked channels across ${client.guilds.cache.size} guilds`);
  }

  async recoverVoiceChannels(client: Client) {
    let recovered = 0;
    let cleaned = 0;

    for (const guild of client.guilds.cache.values()) {
      const textChannels = guild.channels.cache.filter(
        (ch): ch is TextChannel => ch.type === ChannelType.GuildText && !!(ch as TextChannel).topic?.includes(TMP_VOICE_TOPIC_MARKER)
      );

      for (const textChannel of textChannels.values()) {
        const match = textChannel.topic?.match(/tmp-voice-tracked (\d+)/);
        if (!match) continue;

        const voiceChannelId = match[1];
        const rawChannel = guild.channels.cache.get(voiceChannelId);
        if (!rawChannel || rawChannel.type !== ChannelType.GuildVoice) {
          textChannel.delete().catch(() => null);
          cleaned++;
          continue;
        }

        const voiceChannel = rawChannel as VoiceChannel;
        const hasMembers = voiceChannel.members.size > 0;

        if (!hasMembers) {
          this.voiceTextChannels.delete(voiceChannelId);
          this.voiceOwners.delete(voiceChannelId);
          textChannel.delete().catch(() => null);
          voiceChannel.delete().catch(() => null);
          cleaned++;
          continue;
        }

        this.voiceTextChannels.set(voiceChannelId, textChannel.id);

        const firstMember = voiceChannel.members.first();
        if (firstMember) {
          this.voiceOwners.set(voiceChannelId, firstMember.id);

          await voiceChannel.permissionOverwrites.edit(firstMember.id, {
            ManageChannels: true,
            MuteMembers: true,
            DeafenMembers: true,
            MoveMembers: true,
            ViewChannel: true,
            Connect: true,
          }).catch(() => null);

          for (const [, m] of voiceChannel.members) {
            await textChannel.permissionOverwrites.create(m.id, {
              ViewChannel: true,
              ReadMessageHistory: true,
              SendMessages: true,
            }).catch(() => null);
          }
        }

        recovered++;
      }
    }

    logger.info(`TmpVoiceManager: Recovered ${recovered} voice channels, cleaned ${cleaned} empty channels`);
  }
}

export const tmpVoiceManager = new TmpVoiceManager();
