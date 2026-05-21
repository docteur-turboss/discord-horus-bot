import { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { reply } from "utils/discord/reply";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { tmpVoiceManager } from "utils/discord/tmpVoiceManager";
import { validateTmpVoiceCommand } from "utils/discord/validateTmpVoiceCommand";

export const data = new SlashCommandBuilder()
  .setName("voice-limit")
  .setDescription("Set or remove the user limit on your temporary voice channel")
  .setDescriptionLocalizations({
    fr: "Définir ou supprimer la limite d'utilisateurs de votre salon vocal temporaire",
  })
  .addIntegerOption((option) =>
    option
      .setName("limit")
      .setNameLocalizations({ fr: "limite" })
      .setDescription("User limit (0 to remove)")
      .setDescriptionLocalizations({ fr: "Limite d'utilisateurs (0 pour supprimer)" })
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

    const limit = interaction.options.getInteger("limit", true);
    await voiceChannel.setUserLimit(Math.max(0, limit));

    if (limit <= 0) {
      await reply(interaction, {
        key: "tmp_voice.limit_removed",
        ephemeral: false,
        type: "success",
        vars: { channel: voiceChannel.name },
      });
    } else {
      await reply(interaction, {
        key: "tmp_voice.limit_success",
        ephemeral: false,
        type: "success",
        vars: { limit: String(limit), channel: voiceChannel.name },
      });
    }
  } catch (err) {
    catchErrorInCommand(err, interaction, "voice-limit");
  }
};
