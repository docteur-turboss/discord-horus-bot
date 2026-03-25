import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ChannelSelectMenuBuilder, ChatInputCommandInteraction, GuildMember, InteractionReplyOptions, MentionableSelectMenuBuilder, MessageFlags, RoleSelectMenuBuilder, StringSelectMenuBuilder, UserSelectMenuBuilder } from "discord.js";
import { TranslationKey, VarsFor } from "utils/locales/i18n.types";
import { warningEmbed } from "../embeds/warningEmbed";
import { successEmbed } from "../embeds/successEmbed";
import { errorEmbed } from "../embeds/errorEmbeds";
import { infoEmbed } from "../embeds/infoEmbed";
import { logger } from "../logger/logger";
import { t } from "../locales/i18n";

type ReplyOptions<K extends TranslationKey = TranslationKey> = {
  key: K;
  type?: EmbedType;
  ephemeral?: boolean;
  vars?: VarsFor<K>;
  withResponse?: boolean;
  components?:  ActionRowBuilder<
    ButtonBuilder |
    MentionableSelectMenuBuilder |
    RoleSelectMenuBuilder |
    UserSelectMenuBuilder |
    StringSelectMenuBuilder |
    ChannelSelectMenuBuilder
  >[];
}

type EmbedType = "success" | "error" | "info" | "warning";
type Interaction = ChatInputCommandInteraction | ButtonInteraction;

const buildEmbed = (type: EmbedType, description: string, lang: string) => {
  switch (type) {
    case "error":
      return errorEmbed({ description, lang });
    case "info":
      return infoEmbed({ description, lang });
    case "warning":
      return warningEmbed({ description, lang });
    default:
      return successEmbed({ description, lang });
  }
};

export const reply = async <K extends TranslationKey>(
  interaction: Interaction,
  options: ReplyOptions<K>
) => {
  return interaction.reply(constructOpt(interaction, options).opt);
};

export const followUp = async <K extends TranslationKey>(
  interaction: Interaction,
  options: ReplyOptions<K>
) => {
  return interaction.followUp(constructOpt(interaction, options).opt);
};

export const editReply = async <K extends TranslationKey>(
  interaction: Interaction,
  options: ReplyOptions<K>
) => {
  return interaction.editReply({
    embeds: [constructOpt(interaction, options).embed],
    components: options.components ?? [],
  });
};

export const targetSend = async <K extends TranslationKey>(
  user: GuildMember,
  interaction: Interaction,
  options: ReplyOptions<K>
) => {
  return user.send({
    embeds: [constructOpt(interaction, options).embed],
    components: options.components ?? [],
  }).catch(() => {
    logger.warn(`Could not send DM to ${user.user.tag} (${user.id})`);
  });
};

const constructOpt = <K extends TranslationKey> (
  interaction: Interaction,
  options: ReplyOptions<K>
) => {

  const lang = interaction.locale.split("-")[0];
  const description = t(interaction, options.key, options.vars);
  const embed = buildEmbed(options.type ?? "success", description, lang);

  const opt: InteractionReplyOptions = {
    embeds: [embed],
    components: options.components ?? [],
  };

  if (options.ephemeral) {
    opt.flags = MessageFlags.Ephemeral;
  }

  if (options.withResponse) {
    return {
      embed,
      opt: {
        ...opt,
        withResponse: true as const,
      },
    };
  }

  return { embed, opt };
};