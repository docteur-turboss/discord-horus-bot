import { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { reply } from "utils/discord/reply";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { tmpVoiceManager } from "utils/discord/tmpVoiceManager";
import { validateTmpVoiceCommand } from "utils/discord/validateTmpVoiceCommand";

export const data = new SlashCommandBuilder()
  .setName("voice-owner")
  .setDescription("Show the owner of your temporary voice channel")
  .setDescriptionLocalizations({
    fr: "Afficher le propriétaire de votre salon vocal temporaire",
  })
  .setDefaultMemberPermissions(PermissionFlagsBits.Connect)
  .setContexts(InteractionContextType.Guild);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
  try {
    const validated = await validateTmpVoiceCommand(interaction);
    if (!validated) return;
    const { voiceChannel } = validated;

    const ownerId = tmpVoiceManager.getOwnerByChannel(voiceChannel.id);

    if (!ownerId) {
      return reply(interaction, {
        key: "tmp_voice.owner_no_owner",
        ephemeral: false,
        type: "info",
      });
    }

    const ownerMember = interaction.guild!.members.cache.get(ownerId);
    const ownerTag = ownerMember?.user?.tag ?? ownerId;

    await reply(interaction, {
      key: "tmp_voice.owner_info",
      ephemeral: false,
      type: "info",
      vars: { channel: voiceChannel.name, user: ownerTag },
    });
  } catch (err) {
    catchErrorInCommand(err, interaction, "voice-owner");
  }
};
