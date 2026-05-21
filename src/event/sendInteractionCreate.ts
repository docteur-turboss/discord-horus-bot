import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelSelectMenuInteraction,
  ChannelType,
  ContainerBuilder,
  EmbedBuilder,
  Events,
  Interaction,
  MessageFlags,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
  TextChannel,
} from "discord.js";
import { errorEmbed } from "utils/embeds/errorEmbeds";
import { successEmbed } from "utils/embeds/successEmbed";
import { logger } from "utils/logger/logger";
import { t } from "utils/locales/i18n";

type EmbedFieldData = {
  name: string;
  value: string;
  inline: boolean;
};

type WizardState = {
  type: "classic" | "embed";
  channelId: string;
  content?: string;
  title?: string;
  description?: string;
  fields?: EmbedFieldData[];
  imageUrl?: string;
  thumbnailUrl?: string;
  footerText?: string;
  timestamp?: boolean;
  followUpMessageId?: string;
};

const userWizardState = new Map<string, WizardState>();

function getLang(interaction: Interaction): string {
  return interaction.locale?.split("-")[0] ?? "en";
}

function stateKey(interaction: Interaction): string {
  return `${interaction.user.id}-${interaction.guildId}`;
}

function getState(interaction: Interaction): WizardState | undefined {
  return userWizardState.get(stateKey(interaction));
}

export function setState(interaction: Interaction, data: Partial<WizardState>): WizardState {
  const key = stateKey(interaction);
  const existing = userWizardState.get(key) ?? { type: "classic", channelId: "" };
  const updated = { ...existing, ...data };
  userWizardState.set(key, updated);
  return updated;
}

function clearState(interaction: Interaction): void {
  userWizardState.delete(stateKey(interaction));
}

function sessionExpiredEmbed(lang: string): EmbedBuilder {
  return errorEmbed({ description: "Session expired. Please start over with `/send`.", lang });
}

export function buildSendContainer(lang: string, state?: WizardState): ContainerBuilder {
  const channelText = state?.channelId
    ? `📍 <#${state.channelId}>`
    : `📍 **${t(lang, "send.channel_select")}:** ${t(lang, "send.not_selected")}`;

  const typeText = state?.type === "embed"
    ? `📝 **${t(lang, "send.type_embed")}**`
    : `📝 **${t(lang, "send.type_classic")}**`;

  const typeBtnLabel = state?.type === "embed"
    ? t(lang, "send.type_switch_classic")
    : t(lang, "send.type_switch_embed");

  return new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(`# ✉️ ${t(lang, "send.setup_title")}`)
    )
    .addSeparatorComponents((separator) => separator)
    .addSectionComponents((section) =>
      section
        .addTextDisplayComponents((textDisplay) =>
          textDisplay.setContent(channelText)
        )
        .setButtonAccessory((btn) =>
          btn
            .setCustomId("send_channel_btn")
            .setLabel(t(lang, "send.channel_btn"))
            .setStyle(ButtonStyle.Primary)
        )
    )
    .addSectionComponents((section) =>
      section
        .addTextDisplayComponents((textDisplay) =>
          textDisplay.setContent(typeText)
        )
        .setButtonAccessory((btn) =>
          btn
            .setCustomId("send_type_btn")
            .setLabel(typeBtnLabel)
            .setStyle(ButtonStyle.Secondary)
        )
    )
    .addSeparatorComponents((separator) => separator)
    .addSectionComponents((section) =>
      section
        .addTextDisplayComponents((textDisplay) =>
          textDisplay.setContent(`▶️ ${t(lang, "send.ready")}`)
        )
        .setButtonAccessory((btn) =>
          btn
            .setCustomId("send_continue")
            .setLabel(t(lang, "send.continue"))
            .setStyle(ButtonStyle.Primary)
        )
    );
}

function buildClassicModal(lang: string, state?: WizardState): ModalBuilder {
  const contentInput = new TextInputBuilder()
    .setCustomId("content")
    .setLabel(t(lang, "send.modal_content"))
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder(t(lang, "send.modal_content_placeholder"))
    .setRequired(true)
    .setMaxLength(2000);

  if (state?.content) {
    contentInput.setValue(state.content);
  }

  return new ModalBuilder()
    .setCustomId("send_modal_classic")
    .setTitle(t(lang, "send.modal_classic_title"))
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(contentInput),
    );
}

function buildEmbedModal1(lang: string, state?: WizardState): ModalBuilder {
  const titleInput = new TextInputBuilder()
    .setCustomId("title")
    .setLabel(t(lang, "send.modal_embed_title_label"))
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(t(lang, "send.modal_embed_title_placeholder"))
    .setRequired(false)
    .setMaxLength(256);

  if (state?.title) titleInput.setValue(state.title);

  const descInput = new TextInputBuilder()
    .setCustomId("description")
    .setLabel(t(lang, "send.modal_embed_desc"))
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder(t(lang, "send.modal_embed_desc_placeholder"))
    .setRequired(true)
    .setMaxLength(4000);

  if (state?.description) descInput.setValue(state.description);

  const fieldsInput = new TextInputBuilder()
    .setCustomId("fields")
    .setLabel(t(lang, "send.modal_embed_fields"))
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder(t(lang, "send.modal_embed_fields_placeholder"))
    .setRequired(false)
    .setMaxLength(4000);

  if (state?.fields && state.fields.length > 0) {
    fieldsInput.setValue(JSON.stringify(state.fields));
  }

  const imageInput = new TextInputBuilder()
    .setCustomId("image")
    .setLabel(t(lang, "send.modal_embed_image"))
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(t(lang, "send.modal_embed_image_placeholder"))
    .setRequired(false);

  if (state?.imageUrl) imageInput.setValue(state.imageUrl);

  const thumbInput = new TextInputBuilder()
    .setCustomId("thumbnail")
    .setLabel(t(lang, "send.modal_embed_thumbnail"))
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(t(lang, "send.modal_embed_thumbnail_placeholder"))
    .setRequired(false);

  if (state?.thumbnailUrl) thumbInput.setValue(state.thumbnailUrl);

  return new ModalBuilder()
    .setCustomId("send_modal_embed_1")
    .setTitle(t(lang, "send.modal_embed_title_1"))
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(descInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(fieldsInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(thumbInput),
    );
}

function buildEmbedModal2(lang: string, state?: WizardState): ModalBuilder {
  const footerInput = new TextInputBuilder()
    .setCustomId("footer")
    .setLabel(t(lang, "send.modal_embed_footer"))
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(t(lang, "send.modal_embed_footer_placeholder"))
    .setRequired(false)
    .setMaxLength(256);

  if (state?.footerText) footerInput.setValue(state.footerText);

  const timestampInput = new TextInputBuilder()
    .setCustomId("timestamp")
    .setLabel(t(lang, "send.modal_embed_timestamp"))
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(t(lang, "send.modal_embed_timestamp_placeholder"))
    .setRequired(false)
    .setMaxLength(3);

  if (state?.timestamp !== undefined) {
    timestampInput.setValue(state.timestamp ? "oui" : "non");
  }

  return new ModalBuilder()
    .setCustomId("send_modal_embed_2")
    .setTitle(t(lang, "send.modal_embed_title_2"))
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(footerInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(timestampInput),
    );
}

function buildActualEmbed(state: WizardState): EmbedBuilder {
  const embed = new EmbedBuilder().setColor("#5865F2");

  if (state.title) embed.setTitle(state.title);
  if (state.description) embed.setDescription(state.description);
  if (state.fields && state.fields.length > 0) embed.addFields(state.fields);
  if (state.imageUrl) embed.setImage(state.imageUrl);
  if (state.thumbnailUrl) embed.setThumbnail(state.thumbnailUrl);
  if (state.footerText) embed.setFooter({ text: state.footerText });
  if (state.timestamp) embed.setTimestamp();

  return embed;
}

function buildTextContainer(text: string): ContainerBuilder {
  return new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addTextDisplayComponents((t) => t.setContent(text));
}

function buildPreviewButtons(lang: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("send_send")
      .setLabel(t(lang, "send.preview_send"))
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("send_edit")
      .setLabel(t(lang, "send.preview_edit"))
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("send_cancel")
      .setLabel(t(lang, "send.preview_cancel"))
      .setStyle(ButtonStyle.Danger),
  );
}

function buildPreviewEmbed(state: WizardState, lang: string): EmbedBuilder {
  if (state.type === "classic") {
    return new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle(t(lang, "send.preview_title"))
      .setDescription(state.content ?? "");
  }
  return buildActualEmbed(state).setTitle(
    state.title || t(lang, "send.preview_title"),
  );
}

function buildStep1CompleteContainer(lang: string): ContainerBuilder {
  const continueLabel = t(lang, "send.continue");
  return new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addTextDisplayComponents((td) =>
      td.setContent("✅ **Step 1/2 complete!**\nClick **Continue** below for footer & timestamp options.")
    )
    .addSeparatorComponents((s) => s)
    .addSectionComponents((section) =>
      section
        .addTextDisplayComponents((td) => td.setContent("▶️ " + continueLabel))
        .setButtonAccessory((btn) =>
          btn.setCustomId("send_continue_modal2").setLabel(continueLabel).setStyle(ButtonStyle.Primary)
        )
    );
}

function isAffirmative(value: string): boolean {
  const v = value.toLowerCase().trim();
  return v === "yes" || v === "y" || v === "true" || v === "1" || v === "oui" || v === "o";
}

export const data = {
  event: Events.InteractionCreate,
};

export const main = async (interaction: Interaction) => {
  if (!("customId" in interaction) || !interaction.customId?.startsWith("send_")) return;

  const lang = getLang(interaction);

  try {
    if (interaction.isButton() && interaction.customId === "send_channel_btn") {
      await handleChannelBtn(interaction, lang);
    } else if (interaction.isButton() && interaction.customId === "send_channel_cancel") {
      await handleChannelCancel(interaction, lang);
    } else if (interaction.isButton() && interaction.customId === "send_type_btn") {
      await handleTypeSwitch(interaction, lang);
    } else if (interaction.isChannelSelectMenu() && interaction.customId === "send_target_channel") {
      await handleChannelSelect(interaction, lang);
    } else if (interaction.isButton() && interaction.customId === "send_continue") {
      await handleContinue(interaction, lang);
    } else if (interaction.isButton() && interaction.customId === "send_send") {
      await handleSend(interaction, lang);
    } else if (interaction.isButton() && interaction.customId === "send_edit") {
      await handleEdit(interaction, lang);
    } else if (interaction.isButton() && interaction.customId === "send_continue_modal2") {
      await handleContinueModal2(interaction, lang);
    } else if (interaction.isButton() && interaction.customId === "send_cancel") {
      await handleCancel(interaction, lang);
    } else if (interaction.isModalSubmit() && interaction.customId === "send_modal_classic") {
      await handleClassicModal(interaction, lang);
    } else if (interaction.isModalSubmit() && interaction.customId === "send_modal_embed_1") {
      await handleEmbedModal1(interaction, lang);
    } else if (interaction.isModalSubmit() && interaction.customId === "send_modal_embed_2") {
      await handleEmbedModal2(interaction, lang);
    }
  } catch (error) {
    logger.error("Error in send interaction handler", error as Record<string, unknown>);
    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      await interaction.reply({
        embeds: [errorEmbed({ description: "An unexpected error occurred.", lang })],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
};

async function handleChannelBtn(interaction: ButtonInteraction, lang: string): Promise<void> {
  const channelSelect = new ChannelSelectMenuBuilder()
    .setCustomId("send_target_channel")
    .setPlaceholder(t(lang, "send.channel_select"))
    .setChannelTypes(ChannelType.GuildText);

  const cancelBtn = new ButtonBuilder()
    .setCustomId("send_channel_cancel")
    .setLabel(t(lang, "action.btns.cancel"))
    .setStyle(ButtonStyle.Secondary);

  await interaction.update({
    components: [
      new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelect),
      new ActionRowBuilder<ButtonBuilder>().addComponents(cancelBtn),
    ],
  });
}

async function handleChannelCancel(interaction: ButtonInteraction, lang: string): Promise<void> {
  const state = getState(interaction);
  const container = buildSendContainer(lang, state);
  await interaction.update({ components: [container] });
}

async function handleTypeSwitch(interaction: ButtonInteraction, lang: string): Promise<void> {
  const state = getState(interaction);
  if (!state) {
    await interaction.reply({
      embeds: [sessionExpiredEmbed(lang)],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const newType = state.type === "classic" ? "embed" as const : "classic" as const;
  setState(interaction, { type: newType });

  const container = buildSendContainer(lang, { ...state, type: newType });
  await interaction.update({ components: [container] });
}

async function handleChannelSelect(interaction: ChannelSelectMenuInteraction, lang: string): Promise<void> {
  const channelId = interaction.values[0];
  const state = setState(interaction, { channelId });

  const container = buildSendContainer(lang, state);
  await interaction.update({ components: [container] });
}

async function handleContinue(interaction: ButtonInteraction, lang: string): Promise<void> {
  const state = getState(interaction);
  if (!state) {
    await interaction.reply({
      embeds: [sessionExpiredEmbed(lang)],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (!state.channelId) {
    await interaction.reply({
      embeds: [errorEmbed({ description: t(lang, "send.error_no_channel"), lang })],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (state.type === "classic") {
    const modal = buildClassicModal(lang, state);
    await interaction.showModal(modal);
  } else {
    const modal = buildEmbedModal1(lang, state);
    await interaction.showModal(modal);
  }
}

async function handleClassicModal(interaction: ModalSubmitInteraction, lang: string): Promise<void> {
  const content = interaction.fields.getTextInputValue("content");
  const state = setState(interaction, { content });

  const previewEmbed = buildPreviewEmbed(state, lang);

  if (state.followUpMessageId) {
    await (interaction as any).update({
      embeds: [previewEmbed],
      components: [buildPreviewButtons(lang)],
    });
  } else {
    await (interaction as any).update({
      components: [buildTextContainer(`✅ ${t(lang, "send.preview_ready")}`)],
    });
    const followUp = await interaction.followUp({
      embeds: [previewEmbed],
      components: [buildPreviewButtons(lang)],
      flags: MessageFlags.Ephemeral
    });
    setState(interaction, { followUpMessageId: followUp.id });
  }
}

async function handleEmbedModal1(interaction: ModalSubmitInteraction, lang: string): Promise<void> {
  const title = interaction.fields.getTextInputValue("title") || undefined;
  const description = interaction.fields.getTextInputValue("description");
  const fieldsRaw = interaction.fields.getTextInputValue("fields") || undefined;
  const imageUrl = interaction.fields.getTextInputValue("image") || undefined;
  const thumbnailUrl = interaction.fields.getTextInputValue("thumbnail") || undefined;

  let fields: EmbedFieldData[] | undefined;
  if (fieldsRaw) {
    try {
      fields = JSON.parse(fieldsRaw);
      if (!Array.isArray(fields)) throw new Error("Not an array");
    } catch {
      await interaction.reply({
        embeds: [errorEmbed({ description: t(lang, "send.error_invalid_fields"), lang })],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
  }

  setState(interaction, { title, description, fields, imageUrl, thumbnailUrl });

  const continueLabel = t(lang, "send.continue");

  if (getState(interaction)?.followUpMessageId) {
    await (interaction as any).update({
      embeds: [successEmbed({
        description: "✅ **Step 1/2 complete!** Click **Continue** below for footer & timestamp options.",
        lang,
      })],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("send_continue_modal2")
            .setLabel(continueLabel)
            .setStyle(ButtonStyle.Primary),
        ),
      ],
    });
  } else {
    const container = buildStep1CompleteContainer(lang);
    await (interaction as any).update({ components: [container] });
  }
}

async function handleEmbedModal2(interaction: ModalSubmitInteraction, lang: string): Promise<void> {
  const footerText = interaction.fields.getTextInputValue("footer") || undefined;
  const timestampRaw = interaction.fields.getTextInputValue("timestamp") || undefined;
  const timestamp = timestampRaw ? isAffirmative(timestampRaw) : true;

  setState(interaction, { footerText, timestamp });
  const state = getState(interaction)!;

  const previewEmbed = buildPreviewEmbed(state, lang);

  if (state.followUpMessageId) {
    await (interaction as any).update({
      embeds: [previewEmbed],
      components: [buildPreviewButtons(lang)],
    });
  } else {
    await (interaction as any).update({
      components: [buildTextContainer(`✅ ${t(lang, "send.preview_ready")}`)],
    });
    const followUp = await interaction.followUp({
      embeds: [previewEmbed],
      components: [buildPreviewButtons(lang)],
      flags: MessageFlags.Ephemeral
    });
    setState(interaction, { followUpMessageId: followUp.id });
  }
}

async function handleSend(interaction: ButtonInteraction, lang: string): Promise<void> {
  const state = getState(interaction);
  if (!state) {
    await interaction.update({ embeds: [sessionExpiredEmbed(lang)], components: [] });
    return;
  }

  await interaction.deferUpdate();

  try {
    const channel = interaction.guild?.channels.cache.get(state.channelId) as TextChannel | undefined;
    if (!channel) throw new Error("Channel not found");

    if (state.type === "classic") {
      await channel.send(state.content!);
    } else {
      await channel.send({ embeds: [buildActualEmbed(state)] });
    }

    await interaction.editReply({
      embeds: [successEmbed({ description: t(lang, "send.sent", { channel: `<#${state.channelId}>` }), lang })],
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    await interaction.editReply({
      embeds: [errorEmbed({ description: t(lang, "send.error_send_failed", { error: errMsg }), lang })],
    });
  }

  clearState(interaction);
}

async function handleEdit(interaction: ButtonInteraction, lang: string): Promise<void> {
  const state = getState(interaction);
  if (!state) {
    await interaction.reply({
      embeds: [sessionExpiredEmbed(lang)],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (state.type === "classic") {
    const modal = buildClassicModal(lang, state);
    await interaction.showModal(modal);
  } else {
    const modal = buildEmbedModal1(lang, state);
    await interaction.showModal(modal);
  }
}

async function handleContinueModal2(interaction: ButtonInteraction, lang: string): Promise<void> {
  const state = getState(interaction);
  if (!state) {
    await interaction.reply({
      embeds: [sessionExpiredEmbed(lang)],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const modal = buildEmbedModal2(lang, state);
  await interaction.showModal(modal);
}

async function handleCancel(interaction: ButtonInteraction, lang: string): Promise<void> {
  clearState(interaction);

  await interaction.update({
    embeds: [successEmbed({ description: t(lang, "send.cancelled"), lang })],
    components: [],
  });
}
