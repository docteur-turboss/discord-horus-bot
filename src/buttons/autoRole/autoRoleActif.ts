import { ActionRowBuilder, ButtonInteraction, MessageFlags, RoleSelectMenuBuilder } from "discord.js";
import { t } from "utils/locales/i18n";
import { autoRoleManager } from "utils/discord/autoRoleManager";
import { infoEmbed } from "utils/embeds/infoEmbed";

export const data = {
  name: "embeds.logs.auto_role.actif",
};

export const main = async (interaction: ButtonInteraction) => {
  if (!interaction.guild) return;

  const lang = interaction.locale.split("-")[0];
  const current = autoRoleManager.getAutoRole(interaction.guild.id);
  const currentRole = current ? interaction.guild.roles.cache.get(current) : null;

  const selectMenu = new RoleSelectMenuBuilder()
    .setCustomId("auto_role_select")
    .setPlaceholder(t(lang, "auto_role.select_placeholder"))
    .setMinValues(0)
    .setMaxValues(1);

  const embed = infoEmbed({
    description: currentRole
      ? t(lang, "auto_role.current_role", { role: currentRole.toString() })
      : t(lang, "auto_role.select_prompt"),
    lang,
  });

  await interaction.reply({
    embeds: [embed],
    components: [new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(selectMenu)],
    flags: MessageFlags.Ephemeral,
  });
};
