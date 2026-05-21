import { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { reply } from "utils/discord/reply";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { tmpVoiceManager } from "utils/discord/tmpVoiceManager";
import { validateTmpVoiceCommand } from "utils/discord/validateTmpVoiceCommand";

export const data = new SlashCommandBuilder()
  .setName("voice-rename")
  .setDescription("Rename your temporary voice channel and its text channel")
  .setDescriptionLocalizations({
    fr: "Renommer votre salon vocal temporaire et son salon textuel",
  })
  .addStringOption((option) =>
    option
      .setName("name")
      .setNameLocalizations({ fr: "nom" })
      .setDescription("New name for the voice channel")
      .setDescriptionLocalizations({ fr: "Nouveau nom du salon vocal" })
      .setRequired(true)
      .setMaxLength(32)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Connect)
  .setContexts(InteractionContextType.Guild);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
  try {
    const validated = await validateTmpVoiceCommand(interaction);
    if (!validated) return;
    const { voiceChannel } = validated;
    const guild = interaction.guild!;
    const member = guild.members.cache.get(interaction.user.id)!;

    if (!tmpVoiceManager.isVoiceOwner(member, voiceChannel)) {
      return reply(interaction, {
        key: "errors.tmp_voice_not_owner",
        ephemeral: true,
        type: "error",
      });
    }

    const newName = interaction.options.getString("name", true).trim();

    await voiceChannel.setName(newName);

    const textChannelId = tmpVoiceManager.getTextChannel(voiceChannel.id);
    if (textChannelId) {
      const textChannel = guild.channels.cache.get(textChannelId);
      if (textChannel) {
        const sanitized = newName.replace(/[^a-zA-Z0-9 -]/g, "").replace(/\s+/g, "-").toLowerCase();
        await textChannel.setName(`${sanitized}-voice`).catch(() => null);
      }
    }

    await reply(interaction, {
      key: "tmp_voice.rename_success",
      ephemeral: false,
      type: "success",
    });
  } catch (err) {
    catchErrorInCommand(err, interaction, "voice-rename");
  }
};
