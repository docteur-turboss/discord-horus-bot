import { ChatInputCommandInteraction, InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { setState, buildSendContainer } from "event/sendInteractionCreate";
import { t } from "utils/locales/i18n";

export const data = new SlashCommandBuilder()
  .setName("send")
  .setDescription("Send a message to a channel")
  .setDescriptionLocalizations({ fr: "Envoyer un message dans un salon" })
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .setContexts(InteractionContextType.Guild);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
  const lang = interaction.locale.split("-")[0];

  setState(interaction, { type: "classic", channelId: "" });

  const container = buildSendContainer(lang);

  await interaction.reply({
    components: [container],
    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
  });
};
