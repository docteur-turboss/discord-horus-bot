import { ChatInputCommandInteraction, VoiceChannel } from "discord.js";
import { tmpVoiceManager } from "./tmpVoiceManager";
import { reply } from "./reply";

export const validateTmpVoiceCommand = async (
  interaction: ChatInputCommandInteraction
): Promise<{ voiceChannel: VoiceChannel } | null> => {
  const guild = interaction.guild;
  if (!guild) return null;

  const member = guild.members.cache.get(interaction.user.id);
  if (!member?.voice?.channel) {
    await reply(interaction, {
      key: "errors.tmp_voice_not_in_voice",
      ephemeral: true,
      type: "error",
    });
    return null;
  }

  const voiceChannel = member.voice.channel as VoiceChannel;
  if (!tmpVoiceManager.isOwnedVoiceChannel(voiceChannel.id)) {
    await reply(interaction, {
      key: "errors.tmp_voice_not_in_voice",
      ephemeral: true,
      type: "error",
    });
    return null;
  }

  const voiceTextId = tmpVoiceManager.getTextChannel(voiceChannel.id);
  if (!voiceTextId || interaction.channelId !== voiceTextId) {
    await reply(interaction, {
      key: "errors.tmp_voice_wrong_channel",
      ephemeral: true,
      type: "error",
      vars: { channel: `<#${voiceTextId ?? voiceChannel.id}>` },
    });
    return null;
  }

  return { voiceChannel };
};
