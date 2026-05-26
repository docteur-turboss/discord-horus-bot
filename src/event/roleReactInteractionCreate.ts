import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ContainerBuilder,
  EmbedBuilder,
  Events,
  GuildMember,
  Interaction,
  MessageFlags,
  ModalBuilder,
  ModalSubmitInteraction,
  RoleSelectMenuBuilder,
  RoleSelectMenuInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { ROLE_REACT_MENU_ID, ROLE_REACT_PREFIX, ROLE_REACT_WIZARD_PREFIX } from "utils/consts/roleReactTypes";
import { errorEmbed } from "utils/embeds/errorEmbeds";
import { infoEmbed } from "utils/embeds/infoEmbed";
import { successEmbed } from "utils/embeds/successEmbed";
import { logger } from "utils/logger/logger";
import { t } from "utils/locales/i18n";

type EmbedFieldData = {
  name: string;
  value: string;
  inline: boolean;
};

export type WizardState = {
  type: "button" | "menu";
  roleIds: string[];
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
  const existing = userWizardState.get(key) ?? { type: "button" as const, roleIds: [] };
  const updated = { ...existing, ...data };
  userWizardState.set(key, updated);
  return updated;
}

function clearState(interaction: Interaction): void {
  userWizardState.delete(stateKey(interaction));
}

function sessionExpiredEmbed(lang: string): EmbedBuilder {
  return errorEmbed({ description: t(lang, "role_react.session_expired"), lang });
}

function buildModal1(lang: string, state?: WizardState): ModalBuilder {
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
    .setCustomId(`${ROLE_REACT_WIZARD_PREFIX}modal_1`)
    .setTitle(t(lang, "send.modal_embed_title_1"))
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(descInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(fieldsInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(thumbInput),
    );
}

function buildModal2(lang: string, state?: WizardState): ModalBuilder {
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
    .setCustomId(`${ROLE_REACT_WIZARD_PREFIX}modal_2`)
    .setTitle(t(lang, "send.modal_embed_title_2"))
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(footerInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(timestampInput),
    );
}

function buildFinalEmbed(state: WizardState): EmbedBuilder {
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

function getRoleName(roleId: string, guild: { roles: { cache: Map<string, { name: string }> } } | undefined): string {
  return guild?.roles.cache.get(roleId)?.name ?? roleId;
}

function buildFinalComponents(
  state: WizardState,
  guild: { roles: { cache: Map<string, { name: string }> } } | undefined,
  lang: string,
): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] {
  if (state.type === "button") {
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    let currentRow = new ActionRowBuilder<ButtonBuilder>();
    let count = 0;

    for (const roleId of state.roleIds) {
      if (count === 5) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder<ButtonBuilder>();
        count = 0;
      }
      const label = getRoleName(roleId, guild);
      currentRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`${ROLE_REACT_PREFIX}${roleId}`)
          .setLabel(label)
          .setStyle(ButtonStyle.Primary),
      );
      count++;
    }

    if (count > 0) rows.push(currentRow);
    return rows;
  }

  const options = state.roleIds.map((roleId) => {
    const label = getRoleName(roleId, guild);
    return new StringSelectMenuOptionBuilder()
      .setLabel(label)
      .setValue(roleId);
  });

  return [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(ROLE_REACT_MENU_ID)
        .setPlaceholder(t(lang, "role_react.select_placeholder"))
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(options),
    ),
  ];
}

function buildPreviewButtons(lang: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${ROLE_REACT_WIZARD_PREFIX}send`)
      .setLabel(t(lang, "role_react.preview_send"))
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`${ROLE_REACT_WIZARD_PREFIX}edit`)
      .setLabel(t(lang, "role_react.preview_edit"))
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`${ROLE_REACT_WIZARD_PREFIX}cancel`)
      .setLabel(t(lang, "role_react.preview_cancel"))
      .setStyle(ButtonStyle.Danger),
  );
}

function isAffirmative(value: string): boolean {
  const v = value.toLowerCase().trim();
  return v === "yes" || v === "y" || v === "true" || v === "1" || v === "oui" || v === "o";
}

function buildTextContainer(text: string): ContainerBuilder {
  return new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addTextDisplayComponents((t) => t.setContent(text));
}

export function buildSetupContainer(lang: string, state: WizardState): ContainerBuilder {
  const typeText = state.type === "button"
    ? t(lang, "role_react.type_button")
    : t(lang, "role_react.type_menu");

  const typeBtnLabel = state.type === "button"
    ? t(lang, "role_react.switch_to_menu")
    : t(lang, "role_react.switch_to_btn");

  const rolesText = state.roleIds.length > 0
    ? state.roleIds.map((id) => `<@&${id}>`).join(", ")
    : `**${t(lang, "role_react.roles_none")}**`;

  return new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addTextDisplayComponents((td) =>
      td.setContent(`# 🎭 ${t(lang, "role_react.setup_title")}`)
    )
    .addTextDisplayComponents((td) =>
      td.setContent(t(lang, "role_react.setup_desc"))
    )
    .addSeparatorComponents((s) => s)
    .addSectionComponents((section) =>
      section
        .addTextDisplayComponents((td) =>
          td.setContent(`📋 **${t(lang, "role_react.type_label")}:** ${typeText}`)
        )
        .setButtonAccessory((btn) =>
          btn
            .setCustomId(`${ROLE_REACT_WIZARD_PREFIX}type`)
            .setLabel(typeBtnLabel)
            .setStyle(ButtonStyle.Secondary)
        )
    )
    .addSectionComponents((section) =>
      section
        .addTextDisplayComponents((td) =>
          td.setContent(`👥 **${t(lang, "role_react.roles_label")}:** ${rolesText}`)
        )
        .setButtonAccessory((btn) =>
          btn
            .setCustomId(`${ROLE_REACT_WIZARD_PREFIX}roles`)
            .setLabel(t(lang, "role_react.roles_select_btn"))
            .setStyle(ButtonStyle.Primary)
        )
    )
    .addSeparatorComponents((s) => s)
    .addSectionComponents((section) =>
      section
        .addTextDisplayComponents((td) =>
          td.setContent(`▶️ ${t(lang, "role_react.continue")}`)
        )
        .setButtonAccessory((btn) =>
          btn
            .setCustomId(`${ROLE_REACT_WIZARD_PREFIX}continue`)
            .setLabel(t(lang, "role_react.continue"))
            .setStyle(ButtonStyle.Primary)
        )
    );
}

function buildStep1CompleteContainer(lang: string): ContainerBuilder {
  return new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addTextDisplayComponents((td) =>
      td.setContent(t(lang, "role_react.step1_complete"))
    )
    .addSeparatorComponents((s) => s)
    .addSectionComponents((section) =>
      section
        .addTextDisplayComponents((td) =>
          td.setContent(`▶️ ${t(lang, "role_react.continue")}`)
        )
        .setButtonAccessory((btn) =>
          btn
            .setCustomId(`${ROLE_REACT_WIZARD_PREFIX}continue_2`)
            .setLabel(t(lang, "role_react.continue"))
            .setStyle(ButtonStyle.Primary)
        )
    );
}

export const data = {
  event: Events.InteractionCreate,
};

export const main = async (interaction: Interaction) => {
  if (!("customId" in interaction) || !interaction.customId) return;

  const lang = getLang(interaction);

  if (interaction.isStringSelectMenu() && interaction.customId === ROLE_REACT_MENU_ID) {
    await handleFinalMenuSelect(interaction, lang);
    return;
  }

  if (!interaction.customId.startsWith(ROLE_REACT_WIZARD_PREFIX)) return;

  try {
    if (interaction.isButton() && interaction.customId === `${ROLE_REACT_WIZARD_PREFIX}type`) {
      await handleTypeToggle(interaction, lang);
    } else if (interaction.isButton() && interaction.customId === `${ROLE_REACT_WIZARD_PREFIX}roles`) {
      await handleRolesBtn(interaction, lang);
    } else if (interaction.isRoleSelectMenu() && interaction.customId === `${ROLE_REACT_WIZARD_PREFIX}roles_select`) {
      await handleRolesSelect(interaction, lang);
    } else if (interaction.isButton() && interaction.customId === `${ROLE_REACT_WIZARD_PREFIX}roles_cancel`) {
      await handleRolesCancel(interaction, lang);
    } else if (interaction.isButton() && interaction.customId === `${ROLE_REACT_WIZARD_PREFIX}continue`) {
      await handleContinue(interaction, lang);
    } else if (interaction.isButton() && interaction.customId === `${ROLE_REACT_WIZARD_PREFIX}continue_2`) {
      await handleContinue2(interaction, lang);
    } else if (interaction.isButton() && interaction.customId === `${ROLE_REACT_WIZARD_PREFIX}send`) {
      await handleSend(interaction, lang);
    } else if (interaction.isButton() && interaction.customId === `${ROLE_REACT_WIZARD_PREFIX}edit`) {
      await handleEdit(interaction, lang);
    } else if (interaction.isButton() && interaction.customId === `${ROLE_REACT_WIZARD_PREFIX}cancel`) {
      await handleCancel(interaction, lang);
    } else if (interaction.isModalSubmit() && interaction.customId === `${ROLE_REACT_WIZARD_PREFIX}modal_1`) {
      await handleModal1(interaction, lang);
    } else if (interaction.isModalSubmit() && interaction.customId === `${ROLE_REACT_WIZARD_PREFIX}modal_2`) {
      await handleModal2(interaction, lang);
    }
  } catch (error) {
    logger.error("Error in role-react wizard handler", error as Record<string, unknown>);
    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      await interaction.reply({
        embeds: [errorEmbed({ description: "An unexpected error occurred.", lang })],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
};

async function handleTypeToggle(interaction: ButtonInteraction, lang: string): Promise<void> {
  const state = getState(interaction);
  if (!state) {
    await interaction.reply({ embeds: [sessionExpiredEmbed(lang)], flags: MessageFlags.Ephemeral });
    return;
  }

  const newType = state.type === "button" ? "menu" as const : "button" as const;
  setState(interaction, { type: newType });

  const container = buildSetupContainer(lang, { ...state, type: newType });
  await interaction.update({ components: [container] });
}

async function handleRolesBtn(interaction: ButtonInteraction, lang: string): Promise<void> {
  const roleSelect = new RoleSelectMenuBuilder()
    .setCustomId(`${ROLE_REACT_WIZARD_PREFIX}roles_select`)
    .setPlaceholder(t(lang, "role_react.roles_select_placeholder"))
    .setMinValues(1)
    .setMaxValues(25);

  const cancelBtn = new ButtonBuilder()
    .setCustomId(`${ROLE_REACT_WIZARD_PREFIX}roles_cancel`)
    .setLabel(t(lang, "action.btns.cancel"))
    .setStyle(ButtonStyle.Secondary);

  await interaction.update({
    components: [
      new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleSelect),
      new ActionRowBuilder<ButtonBuilder>().addComponents(cancelBtn),
    ],
  });
}

async function handleRolesSelect(interaction: RoleSelectMenuInteraction, lang: string): Promise<void> {
  const roleIds = [...interaction.values];
  setState(interaction, { roleIds });

  const state = getState(interaction)!;
  const container = buildSetupContainer(lang, state);
  await interaction.update({ components: [container] });
}

async function handleRolesCancel(interaction: ButtonInteraction, lang: string): Promise<void> {
  const state = getState(interaction);
  if (!state) {
    await interaction.reply({ embeds: [sessionExpiredEmbed(lang)], flags: MessageFlags.Ephemeral });
    return;
  }

  const container = buildSetupContainer(lang, state);
  await interaction.update({ components: [container] });
}

async function handleContinue(interaction: ButtonInteraction, lang: string): Promise<void> {
  const state = getState(interaction);
  if (!state) {
    await interaction.reply({ embeds: [sessionExpiredEmbed(lang)], flags: MessageFlags.Ephemeral });
    return;
  }

  if (state.roleIds.length === 0) {
    await interaction.reply({
      embeds: [errorEmbed({ description: t(lang, "role_react.no_roles_error"), lang })],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const modal = buildModal1(lang, state);
  await interaction.showModal(modal);
}

async function handleModal1(interaction: ModalSubmitInteraction, lang: string): Promise<void> {
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
        embeds: [errorEmbed({ description: t(lang, "role_react.error_invalid_fields"), lang })],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
  }

  setState(interaction, { title, description, fields, imageUrl, thumbnailUrl });

  if (getState(interaction)?.followUpMessageId) {
    const embed = successEmbed({
      description: t(lang, "role_react.step1_complete"),
      lang,
    });
    await (interaction as any).update({
      embeds: [embed],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(`${ROLE_REACT_WIZARD_PREFIX}continue_2`)
            .setLabel(t(lang, "role_react.continue"))
            .setStyle(ButtonStyle.Primary),
        ),
      ],
    });
  } else {
    const container = buildStep1CompleteContainer(lang);
    await (interaction as any).update({ components: [container] });
  }
}

async function handleContinue2(interaction: ButtonInteraction, lang: string): Promise<void> {
  const state = getState(interaction);
  if (!state) {
    await interaction.reply({ embeds: [sessionExpiredEmbed(lang)], flags: MessageFlags.Ephemeral });
    return;
  }

  const modal = buildModal2(lang, state);
  await interaction.showModal(modal);
}

async function handleModal2(interaction: ModalSubmitInteraction, lang: string): Promise<void> {
  const footerText = interaction.fields.getTextInputValue("footer") || undefined;
  const timestampRaw = interaction.fields.getTextInputValue("timestamp") || undefined;
  const timestamp = timestampRaw ? isAffirmative(timestampRaw) : true;

  setState(interaction, { footerText, timestamp });
  const state = getState(interaction)!;

  const previewEmbed = buildFinalEmbed(state);
  const components = buildFinalComponents(state, interaction.guild ?? undefined, lang);

  if (state.followUpMessageId) {
    await (interaction as any).update({
      embeds: [previewEmbed],
      components: [...components, buildPreviewButtons(lang)],
    });
  } else {
    await (interaction as any).update({
      components: [buildTextContainer(`✅ ${t(lang, "role_react.preview_ready")}`)],
    });
    const followUp = await interaction.followUp({
      embeds: [previewEmbed],
      components: [...components, buildPreviewButtons(lang)],
      flags: MessageFlags.Ephemeral,
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

  if (!interaction.channel || !("send" in interaction.channel)) {
    await interaction.update({
      embeds: [errorEmbed({ description: t(lang, "role_react.error_no_channel"), lang })],
      components: [],
    });
    return;
  }

  const embed = buildFinalEmbed(state);
  const components = buildFinalComponents(state, interaction.guild ?? undefined, lang);

  try {
    await interaction.channel.send({ embeds: [embed], components });
    await interaction.update({
      embeds: [successEmbed({ description: t(lang, "role_react.sent"), lang })],
      components: [],
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    await interaction.update({
      embeds: [errorEmbed({ description: t(lang, "role_react.error_send_failed", { error: errMsg }), lang })],
      components: [],
    });
  }

  clearState(interaction);
}

async function handleEdit(interaction: ButtonInteraction, lang: string): Promise<void> {
  const state = getState(interaction);
  if (!state) {
    await interaction.reply({ embeds: [sessionExpiredEmbed(lang)], flags: MessageFlags.Ephemeral });
    return;
  }

  const modal = buildModal1(lang, state);
  await interaction.showModal(modal);
}

async function handleCancel(interaction: ButtonInteraction, lang: string): Promise<void> {
  clearState(interaction);
  await interaction.update({
    embeds: [successEmbed({ description: t(lang, "role_react.cancelled"), lang })],
    components: [],
  });
}

async function handleFinalMenuSelect(interaction: StringSelectMenuInteraction, lang: string): Promise<void> {
  if (!interaction.guild || !interaction.member) return;
  const member = interaction.member as GuildMember;
  const roleId = interaction.values[0];
  const role = interaction.guild.roles.cache.get(roleId);
  if (!role) {
    await interaction.reply({
      embeds: [errorEmbed({ description: t(lang, "role_react.role_not_found"), lang })],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (member.roles.cache.has(roleId)) {
    await member.roles.remove(roleId);
    await interaction.reply({
      embeds: [infoEmbed({ description: t(lang, "role_react.role_removed", { role: role.name }), lang })],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await member.roles.add(roleId);
  await interaction.reply({
    embeds: [successEmbed({ description: t(lang, "role_react.role_added", { role: role.name }), lang })],
    flags: MessageFlags.Ephemeral,
  });
}
