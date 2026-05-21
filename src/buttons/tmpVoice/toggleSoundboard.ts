import { ButtonInteraction, MessageFlags, PermissionFlagsBits } from "discord.js";
import { togglePermission, buildTmpVoiceContainer } from "utils/embeds/tmpVoiceDashboard";

export const data = { name: "tmp_voice.toggle_soundboard" };

export const main = async (interaction: ButtonInteraction) => {
  if (!interaction.guild || !interaction.member) return;
  const member = interaction.member as any;
  const voiceChannel = member.voice?.channel;
  if (!voiceChannel) return;

  await togglePermission(voiceChannel, PermissionFlagsBits.UseSoundboard);

  const lang = interaction.locale.split("-")[0];
  const container = await buildTmpVoiceContainer(voiceChannel, lang);

  await interaction.update({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });
};
