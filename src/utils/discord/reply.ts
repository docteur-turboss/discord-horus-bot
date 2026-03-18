import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ChannelSelectMenuBuilder, ChatInputCommandInteraction, GuildMember, MentionableSelectMenuBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder, UserSelectMenuBuilder } from "discord.js";
import { warningEmbed } from "../embeds/warningEmbed";
import { successEmbed } from "../embeds/successEmbed";
import { errorEmbed } from "../embeds/errorEmbeds";
import { infoEmbed } from "../embeds/infoEmbed";
import { logger } from "../logger/logger";
import { t } from "../locales/i18n";

type ReplyOptions = {
  key: string;
  type?: EmbedType;
  ephemeral?: boolean;
  vars?: Record<string, string|number|null>;
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
  const description = t(interaction, options.key, options.vars as Record<string, string>);
  const embed = buildEmbed(options.type ?? "success", description);

  const opt = {
    embeds: [embed],
    components: options.components ?? [],
    ...options.ephemeral && { ephemeral: options.ephemeral },
    ...options.withResponse && { withResponse: options.withResponse },
  }

  return interaction.reply(opt);
};

export const followUp = async (
  interaction: Interaction,
  options: ReplyOptions
) => {
  const description = t(interaction, options.key, options.vars as Record<string, string>);
  const embed = buildEmbed(options.type ?? "success", description);

    const opt = {
    embeds: [embed],
    components: options.components ?? [],
    ...options.ephemeral && { ephemeral: options.ephemeral },
    ...options.withResponse && { withResponse: options.withResponse },
  }
  
  return interaction.followUp(opt);
};

export const editReply = async (
  interaction: Interaction,
  options: ReplyOptions
) => {
  const description = t(interaction, options.key, options.vars as Record<string, string>);
  const embed = buildEmbed(options.type ?? "success", description);

  return interaction.editReply({
    embeds: [embed],
    components: options.components ?? [],
  });
};

export const targetSend = async (
  user: GuildMember,
  interaction: Interaction,
  options: Omit<ReplyOptions, "ephemeral" | "withResponse">
) => {
  const description = t(interaction, options.key, options.vars as Record<string, string>);
  const embed = buildEmbed(options.type ?? "success", description);

  return user.send({
    embeds: [embed],
    components: options.components ?? [],
  }).catch(() => {
    logger.warn(`Could not send ban DM to ${user.user.tag} (${user.id})`);
  })
}