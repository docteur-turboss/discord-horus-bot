import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ChannelSelectMenuBuilder, ChatInputCommandInteraction, MentionableSelectMenuBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder, UserSelectMenuBuilder } from "discord.js";
import { warningEmbed } from "utils/embeds/warningEmbed";
import { successEmbed } from "../embeds/successEmbed";
import { errorEmbed } from "../embeds/errorEmbeds";
import { infoEmbed } from "utils/embeds/infoEmbed";
import { t } from "../locales/i18n";

type ReplyOptions = {
  key: string;
  type?: EmbedType;
  ephemeral?: boolean;
  vars?: Record<string, string>;
  withResponse?: boolean;
  components?: ActionRowBuilder<ButtonBuilder|MentionableSelectMenuBuilder|RoleSelectMenuBuilder|UserSelectMenuBuilder|StringSelectMenuBuilder|ChannelSelectMenuBuilder>[];
};

type EmbedType = "success" | "error" | "info" | "warning";
type Interaction = ChatInputCommandInteraction | ButtonInteraction;

const buildEmbed = (type: EmbedType, description: string) => {
  switch (type) {
    case "error":
      return errorEmbed({ description });
    case "info":
      return infoEmbed({ description });
    case "warning":
      return warningEmbed({ description });
    default:
      return successEmbed({ description });
  }
};

export const reply = async (
  interaction: Interaction,
  options: ReplyOptions
) => {
  const description = t(interaction, options.key, options.vars);
  const embed = buildEmbed(options.type ?? "success", description);

  return interaction.reply({
    embeds: [embed],
    components: options.components ?? [],
    ephemeral: options.ephemeral ?? false,
    withResponse: options.withResponse ?? false,
  });
};

export const followUp = async (
  interaction: Interaction,
  options: ReplyOptions
) => {
  const description = t(interaction, options.key, options.vars);
  const embed = buildEmbed(options.type ?? "success", description);

  return interaction.followUp({
    embeds: [embed],
    components: options.components ?? [],
    ephemeral: options.ephemeral ?? false,
    withResponse: options.withResponse ?? false,
  });
};

export const editReply = async (
  interaction: Interaction,
  options: ReplyOptions
) => {
  const description = t(interaction, options.key, options.vars);
  const embed = buildEmbed(options.type ?? "success", description);

  return interaction.editReply({
    embeds: [embed],
    components: options.components ?? [],
  });
};