import { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { reply } from "utils/discord/reply";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { tmpVoiceManager } from "utils/discord/tmpVoiceManager";
import { validateTmpVoiceCommand } from "utils/discord/validateTmpVoiceCommand";

export const data = new SlashCommandBuilder()
  .setName("voice-unban")
  .setDescription("Unban a user from your temporary voice channel")
  .setDescriptionLocalizations({
    fr: "Débannir un utilisateur de votre salon vocal temporaire",
  })
  .addUserOption((option) =>
    option
      .setName("user")
      .setNameLocalizations({ fr: "utilisateur" })
      .setDescription("User to unban")
      .setDescriptionLocalizations({ fr: "Utilisateur à débannir" })
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

    await voiceChannel.permissionOverwrites.edit(target.id, {
      Connect: null,
      ViewChannel: null,
    });

    await reply(interaction, {
      key: "tmp_voice.unban_success",
      ephemeral: false,
      type: "success",
      vars: { user: target.tag },
    });
  } catch (err) {
    catchErrorInCommand(err, interaction, "voice-unban");
  }
};
