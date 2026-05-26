import {
  ChatInputCommandInteraction,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { t } from "utils/locales/i18n";
import { buildSetupContainer, setState, WizardState } from "event/roleReactInteractionCreate";

export const data = new SlashCommandBuilder()
  .setName("role-react")
  .setNameLocalizations({ fr: "role-reaction" })
  .setDescription("Create a role reaction embed with buttons or a select menu")
  .setDescriptionLocalizations({ fr: "Créer un embed de réaction avec des boutons ou un menu de sélection" })
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .setContexts(InteractionContextType.Guild);

export const main = async (interaction: ChatInputCommandInteraction) => {
  const lang = interaction.locale.split("-")[0];
  const guild = interaction.guild;
  if (!guild) return;

  const state: WizardState = setState(interaction, { type: "button", roleIds: [] });

  const container = buildSetupContainer(lang, state);

  await interaction.reply({
    components: [container],
    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
  });
};
