import { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder, VoiceChannel } from "discord.js";
import { reply } from "utils/discord/reply";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { tmpVoiceManager } from "utils/discord/tmpVoiceManager";
import { validateTmpVoiceCommand } from "utils/discord/validateTmpVoiceCommand";

export const data = new SlashCommandBuilder()
  .setName("voice-ban")
  .setDescription("Ban a user from your temporary voice channel")
  .setDescriptionLocalizations({
    fr: "Bannir un utilisateur de votre salon vocal temporaire",
  })
  .addUserOption((option) =>
    option
      .setName("user")
      .setNameLocalizations({ fr: "utilisateur" })
      .setDescription("User to ban")
      .setDescriptionLocalizations({ fr: "Utilisateur à bannir" })
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

    await voiceChannel.permissionOverwrites.edit(target.id, {
      Connect: false,
      ViewChannel: false,
    });

    await targetMember.voice.disconnect().catch(() => null);

    await reply(interaction, {
      key: "tmp_voice.ban_success",
      ephemeral: false,
      type: "success",
      vars: { user: target.tag },
    });
  } catch (err) {
    catchErrorInCommand(err, interaction, "voice-ban");
  }
};
