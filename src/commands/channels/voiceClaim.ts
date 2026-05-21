import { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { reply } from "utils/discord/reply";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { tmpVoiceManager } from "utils/discord/tmpVoiceManager";
import { validateTmpVoiceCommand } from "utils/discord/validateTmpVoiceCommand";

export const data = new SlashCommandBuilder()
  .setName("voice-claim")
  .setDescription("Claim ownership of a temporary voice channel")
  .setDescriptionLocalizations({
    fr: "Réclamer la propriété d'un salon vocal temporaire",
  })
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

    const currentOwnerId = tmpVoiceManager.getOwnerByChannel(voiceChannel.id);

    if (currentOwnerId) {
      const ownerMember = guild.members.cache.get(currentOwnerId);
      if (ownerMember?.voice?.channel?.id === voiceChannel.id) {
        return reply(interaction, {
          key: "errors.tmp_voice_owner_in_channel",
          ephemeral: true,
          type: "error",
        });
      }

      await voiceChannel.permissionOverwrites.delete(currentOwnerId).catch(() => null);
    }

    tmpVoiceManager.setOwner(voiceChannel.id, member.id);
    await voiceChannel.permissionOverwrites.edit(member.id, {
      ManageChannels: true,
      MuteMembers: true,
      DeafenMembers: true,
      MoveMembers: true,
    });

    await reply(interaction, {
      key: "tmp_voice.claim_success",
      ephemeral: false,
      type: "success",
      vars: { channel: voiceChannel.name },
    });
  } catch (err) {
    catchErrorInCommand(err, interaction, "voice-claim");
  }
};
