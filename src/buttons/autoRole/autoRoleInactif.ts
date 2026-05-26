import { ButtonInteraction, Guild, MessageFlags } from "discord.js";
import { t } from "utils/locales/i18n";
import { autoRoleManager } from "utils/discord/autoRoleManager";
import { infoEmbed } from "utils/embeds/infoEmbed";
import { successEmbed } from "utils/embeds/successEmbed";
import { errorEmbed } from "utils/embeds/errorEmbeds";
import { logPanelContainer } from "utils/embeds/logPanelContainer";
import { computeLogState, findDashboardChannelByGuild, getTextChannelsWithTopic } from "utils/helper/getLogChannelWithTopic";

export const data = {
  name: "embeds.logs.auto_role.inactif",
};

export const main = async (interaction: ButtonInteraction) => {
  if (!interaction.guild) return;

  try {
    await interaction.deferUpdate();

    const guild = interaction.guild;
    const lang = interaction.locale.split("-")[0];

    const current = autoRoleManager.getAutoRole(guild.id);
    if (!current) {
      await interaction.followUp({
        embeds: [errorEmbed({ description: t(lang, "auto_role.not_configured"), lang })],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const persist = autoRoleManager.removeAutoRole(guild);

    const reply = await interaction.followUp({
      embeds: [infoEmbed({ description: t(lang, "auto_role.updating_remove"), lang })],
      flags: MessageFlags.Ephemeral,
    });

    persist
      .then(() => reply.edit({ embeds: [successEmbed({ description: t(lang, "auto_role.removed"), lang })] }).catch(() => null))
      .catch(() => reply.edit({ embeds: [errorEmbed({ description: t(lang, "auto_role.remove_error"), lang })] }).catch(() => null));

    refreshDashboard(guild, lang);
  } catch (error) {
    try {
      if (interaction.deferred) {
        await interaction.followUp({
          embeds: [errorEmbed({ description: t(interaction.locale.split("-")[0], "errors.command_execution"), lang: interaction.locale.split("-")[0] })],
          flags: MessageFlags.Ephemeral,
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          embeds: [errorEmbed({ description: t(interaction.locale.split("-")[0], "errors.command_execution"), lang: interaction.locale.split("-")[0] })],
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch {
      // ignore follow-up failures
    }
  }
};

const refreshDashboard = (guild: Guild, lang: string) => {
  (async () => {
    try {
      const dashboard = findDashboardChannelByGuild(guild);
      if (!dashboard) return;

      const channels = getTextChannelsWithTopic(guild);
      const state = computeLogState(channels, guild.id);
      const container = logPanelContainer({ interaction: lang, ...state });

      const messages = await dashboard.messages.fetch({ limit: 10 });
      const botMessage = messages.find((m) => m.author.id === guild.members.me?.id && m.components.length > 0);
      if (botMessage) {
        await botMessage.edit({ components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => null);
      } else {
        await dashboard.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }
    } catch {
      // ignore dashboard refresh errors
    }
  })();
};
