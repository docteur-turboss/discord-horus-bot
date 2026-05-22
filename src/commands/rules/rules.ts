import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { t } from "utils/locales/i18n";
import { reply } from "utils/discord/reply";
import { getRulesAcceptTopic } from "utils/consts/rulesTypes";

export const data = new SlashCommandBuilder()
  .setName("rules")
  .setDescription("Generate a rules message in a channel")
  .setDescriptionLocalizations({ fr: "Générer un message de règlement dans un salon" })
  .addChannelOption((option) =>
    option
      .setName("channel")
      .setDescription("Target channel (defaults to current)")
      .setDescriptionLocalizations({ fr: "Salon cible (par défaut le salon actuel)" })
      .setRequired(false),
  )
  .addStringOption((option) =>
    option
      .setName("type")
      .setDescription("Message type")
      .setDescriptionLocalizations({ fr: "Type de message" })
      .setRequired(false)
      .addChoices(
        { name: "Standard (6 rules)", name_localizations: { fr: "Standard (6 règles)" }, value: "standard" },
        { name: "Minimal (3 rules)", name_localizations: { fr: "Minimal (3 règles)" }, value: "minimal" },
        { name: "Custom", name_localizations: { fr: "Personnalisé" }, value: "custom" },
      ),
  )
  .addStringOption((option) =>
    option
      .setName("content")
      .setDescription("Rules content (for custom type)")
      .setDescriptionLocalizations({ fr: "Contenu du règlement (pour le type personnalisé)" })
      .setRequired(false)
      .setMaxLength(4000),
  )
  .addStringOption((option) =>
    option
      .setName("image")
      .setDescription("Image URL for the embed")
      .setDescriptionLocalizations({ fr: "URL de l'image pour l'embed" })
      .setRequired(false),
  )
  .addRoleOption((option) =>
    option
      .setName("role")
      .setDescription("Role to assign when accepting rules")
      .setDescriptionLocalizations({ fr: "Rôle à attribuer lors de l'acceptation" })
      .setRequired(false),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .setContexts(InteractionContextType.Guild);

export const cooldown = 10;

const STANDARD = [
  { titleKey: "rules.rule_1_title", textKey: "rules.rule_1_text" },
  { titleKey: "rules.rule_2_title", textKey: "rules.rule_2_text" },
  { titleKey: "rules.rule_3_title", textKey: "rules.rule_3_text" },
  { titleKey: "rules.rule_4_title", textKey: "rules.rule_4_text" },
  { titleKey: "rules.rule_5_title", textKey: "rules.rule_5_text" },
  { titleKey: "rules.rule_6_title", textKey: "rules.rule_6_text" },
] as const;

const MINIMAL = [
  { titleKey: "rules.minimal_1_title", textKey: "rules.minimal_1_text" },
  { titleKey: "rules.minimal_2_title", textKey: "rules.minimal_2_text" },
  { titleKey: "rules.minimal_3_title", textKey: "rules.minimal_3_text" },
] as const;

export const main = async (interaction: ChatInputCommandInteraction) => {
  const lang = interaction.locale.split("-")[0];
  const guild = interaction.guild;
  if (!guild) return;

  const targetChannel = (interaction.options.getChannel("channel") || interaction.channel) as TextChannel | null;
  if (!targetChannel || !targetChannel.isTextBased() || !("topic" in targetChannel)) {
    await reply(interaction, { key: "rules.no_channel", type: "error", ephemeral: true });
    return;
  }

  const type = interaction.options.getString("type") || "standard";
  const content = interaction.options.getString("content") || undefined;
  const imageUrl = interaction.options.getString("image") || undefined;
  const role = interaction.options.getRole("role");
  const roleId = role?.id;

  if (roleId) {
    if (roleId === guild.id) {
      await reply(interaction, { key: "rules.role_everyone", type: "error", ephemeral: true });
      return;
    }
    if (role?.managed) {
      await reply(interaction, { key: "rules.role_bot", type: "error", ephemeral: true });
      return;
    }
  }

  const embed = new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle(t(lang, "rules.template_title"))
    .setTimestamp();

  if (imageUrl) {
    try {
      new URL(imageUrl);
      embed.setImage(imageUrl);
    } catch {
      await reply(interaction, { key: "rules.invalid_image_url", type: "error", ephemeral: true });
      return;
    }
  }

  if (type === "custom" && content) {
    embed.setDescription(content);
  } else {
    const rules = type === "minimal" ? MINIMAL : STANDARD;
    for (const rule of rules) {
      embed.addFields({
        name: t(lang, rule.titleKey),
        value: t(lang, rule.textKey),
        inline: false,
      });
    }
    embed.setFooter({ text: t(lang, "rules.template_footer") });
  }

  const components: ActionRowBuilder<ButtonBuilder>[] = [];

  if (roleId) {
    components.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`rules.accept_${roleId}`)
          .setLabel(t(lang, "rules.accept_btn"))
          .setStyle(ButtonStyle.Success),
      ),
    );
  }

  const sent = await targetChannel.send({ embeds: [embed], components });

  if (roleId) {
    const topic = getRulesAcceptTopic(roleId, sent.id);
    const existingTopic = targetChannel.topic ?? "";
    await targetChannel.setTopic(
      existingTopic ? `${existingTopic}\n${topic}` : topic,
    );
  }

  await reply(interaction, {
    key: "rules.sent",
    vars: { channel: targetChannel.toString() },
    ephemeral: true,
  });
};
