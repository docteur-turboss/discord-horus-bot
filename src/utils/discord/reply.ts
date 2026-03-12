import { ChatInputCommandInteraction } from "discord.js";
import { successEmbed } from "../embeds/successEmbed";
import { errorEmbed } from "../embeds/errorEmbeds";
import { t } from "../locales/i18n";

type ReplyOptions = {
  key: string;
  vars?: Record<string, string>;
  ephemeral?: boolean;
};

export const replyError = async (
  interaction: ChatInputCommandInteraction,
  options: ReplyOptions
) => {
  const description = t(interaction, options.key, options.vars);

  return interaction.reply({
    embeds: [errorEmbed({ description })],
    ephemeral: options.ephemeral ?? true,
  });
};

export const followUpError = async (
  interaction: ChatInputCommandInteraction,
  options: ReplyOptions
) => {
  const description = t(interaction, options.key, options.vars);

  return interaction.followUp({
    embeds: [errorEmbed({ description })],
    ephemeral: options.ephemeral ?? true,
  });
};

export const editReplyError = async (
  interaction: ChatInputCommandInteraction,
  options: ReplyOptions
) => {
  const description = t(interaction, options.key, options.vars);

  return interaction.editReply({
    embeds: [errorEmbed({ description })],
  });
};

export const replySuccess = async (
  interaction: ChatInputCommandInteraction,
  options: ReplyOptions
) => {
  const description = t(interaction, options.key, options.vars);

  return interaction.reply({
    embeds: [successEmbed({ description })],
    ephemeral: options.ephemeral ?? false,
  });
};

export const followUpSuccess = async (
  interaction: ChatInputCommandInteraction,
  options: ReplyOptions
) => {
  const description = t(interaction, options.key, options.vars);

  return interaction.followUp({
    embeds: [successEmbed({ description })],
    ephemeral: options.ephemeral ?? true,
  });
};

export const editReplySuccess = async (
  interaction: ChatInputCommandInteraction,
  options: ReplyOptions
) => {
  const description = t(interaction, options.key, options.vars);

  return interaction.editReply({
    embeds: [successEmbed({ description })],
  });
};