import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction } from "discord.js";
import { t } from "utils/locales/i18n";

export const createConfirmationButtons = (interaction: ChatInputCommandInteraction) =>
  new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("confirm_action")
      .setLabel(t(interaction, "action.btns.confirm"))
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("cancel_action")
      .setLabel(t(interaction, "action.btns.cancel"))
      .setStyle(ButtonStyle.Secondary)
  );