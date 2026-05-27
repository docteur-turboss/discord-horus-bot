import {
  ChatInputCommandInteraction,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { t } from "utils/locales/i18n";
import type { TranslationKey } from "utils/locales/i18n.types";
import { buildSetupContainer, setState, WizardState } from "event/roleReactInteractionCreate";
import { resolveTemplate, roleReactTemplates } from "./roleReactTemplates";

export const data = new SlashCommandBuilder()
  .setName("role-react")
  .setNameLocalizations({ fr: "role-reaction" })
  .setDescription("Create a role reaction embed with buttons or a select menu")
  .setDescriptionLocalizations({ fr: "Créer un embed de réaction avec des boutons ou un menu de sélection" })
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .setContexts(InteractionContextType.Guild)
  .addStringOption((option) =>
    option
      .setName("template")
      .setNameLocalizations({ fr: "modèle" })
      .setDescription("Pre-select roles using a template (age, gender, etc.)")
      .setDescriptionLocalizations({ fr: "Pré-sélectionner les rôles avec un modèle (âge, sexe, etc.)" })
      .setRequired(false)
      .addChoices(
        ...roleReactTemplates.map((tpl) => ({ name: tpl.name, value: tpl.name })),
      ),
  );

export const main = async (interaction: ChatInputCommandInteraction) => {
  const lang = interaction.locale.split("-")[0];
  const guild = interaction.guild;
  if (!guild) return;

  const templateName = interaction.options.getString("template");
  let state: WizardState;

  if (templateName) {
    const resolved = resolveTemplate(templateName, guild);
    if (resolved) {
      state = setState(interaction, {
        type: resolved.config.type,
        roleIds: resolved.roleIds,
        title: t(lang, resolved.config.defaultTitleKey as TranslationKey),
        description: t(lang, resolved.config.defaultDescKey as TranslationKey),
      });
    } else {
      state = setState(interaction, { type: "button", roleIds: [] });
    }
  } else {
    state = setState(interaction, { type: "button", roleIds: [] });
  }

  const container = buildSetupContainer(lang, state);

  await interaction.reply({
    components: [container],
    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
  });
};
