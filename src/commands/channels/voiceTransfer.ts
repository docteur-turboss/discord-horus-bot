import { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { reply } from "utils/discord/reply";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { tmpVoiceManager } from "utils/discord/tmpVoiceManager";
import { validateTmpVoiceCommand } from "utils/discord/validateTmpVoiceCommand";

export const data = new SlashCommandBuilder()
  .setName("voice-transfer")
  .setDescription("Transfer ownership of your temporary voice channel")
  .setDescriptionLocalizations({
    fr: "Transférer la propriété de votre salon vocal temporaire",
  })
  .addUserOption((option) =>
    option
      .setName("user")
      .setNameLocalizations({ fr: "utilisateur" })
      .setDescription("New owner")
      .setDescriptionLocalizations({ fr: "Nouveau propriétaire" })
      .setRequired(true)
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

    const target = interaction.options.getUser("user", true);
    const targetMember = guild.members.cache.get(target.id);
    if (!targetMember?.voice?.channel || targetMember.voice.channel.id !== voiceChannel.id) {
      return reply(interaction, {
        key: "errors.tmp_voice_user_not_in_channel",
        ephemeral: true,
        type: "error",
      });
    }

    await voiceChannel.permissionOverwrites.delete(member.id).catch(() => null);

    await voiceChannel.permissionOverwrites.edit(target.id, {
      ManageChannels: true,
      MuteMembers: true,
      DeafenMembers: true,
      MoveMembers: true,
    });

    tmpVoiceManager.setOwner(voiceChannel.id, target.id);

    await reply(interaction, {
      key: "tmp_voice.transfer_success",
      ephemeral: false,
      type: "success",
      vars: { user: target.tag, channel: voiceChannel.name },
    });
  } catch (err) {
    catchErrorInCommand(err, interaction, "voice-transfer");
  }
};
