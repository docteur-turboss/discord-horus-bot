import { Events, Guild, GuildMember, MessageFlags, PermissionFlagsBits, RoleSelectMenuInteraction } from "discord.js";
import { logger } from "utils/logger/logger";
import { autoRoleManager } from "utils/discord/autoRoleManager";
import { logPanelContainer } from "utils/embeds/logPanelContainer";
import { computeLogState, findDashboardChannelByGuild, getTextChannelsWithTopic } from "utils/helper/getLogChannelWithTopic";
import { infoEmbed } from "utils/embeds/infoEmbed";
import { errorEmbed } from "utils/embeds/errorEmbeds";
import { successEmbed } from "utils/embeds/successEmbed";
import { t } from "utils/locales/i18n";

export const data = {
  event: Events.InteractionCreate,
};

export const main = async (interaction: RoleSelectMenuInteraction) => {
  if (!interaction.isRoleSelectMenu()) return;
  if (interaction.customId !== "auto_role_select") return;
  if (!interaction.guild || !interaction.member) return;

  try {
    if (!(interaction.member as GuildMember).permissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({
        embeds: [errorEmbed({ description: t(interaction.locale.split("-")[0], "errors.no_permission_administrator"), lang: interaction.locale.split("-")[0] })],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferUpdate();

    const guild = interaction.guild;
    const botMember = guild.members.me!;
    const lang = interaction.locale.split("-")[0];

    if (interaction.values.length === 0) {
      const current = autoRoleManager.getAutoRole(guild.id);
      if (current) {
        const persist = autoRoleManager.removeAutoRole(guild);
        const reply = await interaction.followUp({
          embeds: [infoEmbed({ description: t(lang, "auto_role.updating_remove"), lang })],
          flags: MessageFlags.Ephemeral,
        });
        persist
          .then(() => reply.edit({ embeds: [successEmbed({ description: t(lang, "auto_role.removed"), lang })] }).catch(() => null))
          .catch(() => reply.edit({ embeds: [errorEmbed({ description: t(lang, "auto_role.remove_error"), lang })] }).catch(() => null));
      } else {
        await interaction.followUp({
          embeds: [errorEmbed({ description: t(lang, "auto_role.no_selection"), lang })],
          flags: MessageFlags.Ephemeral,
        });
      }
      refreshDashboard(guild);
      return;
    }

    const roleId = interaction.values[0];
    const role = guild.roles.cache.get(roleId);

    if (!role) {
      await interaction.followUp({
        embeds: [errorEmbed({ description: t(lang, "auto_role.role_not_found"), lang })],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (role.id === guild.id) {
      await interaction.followUp({
        embeds: [errorEmbed({ description: t(lang, "roles.everyone_error"), lang })],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (role.managed) {
      await interaction.followUp({
        embeds: [errorEmbed({ description: t(lang, "roles.bot_role_error"), lang })],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (botMember.roles.highest.position <= role.position) {
      await interaction.followUp({
        embeds: [errorEmbed({ description: t(lang, "roles.hierarchy_error"), lang })],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const persist = autoRoleManager.setAutoRole(guild, roleId);

    const reply = await interaction.followUp({
      embeds: [infoEmbed({ description: t(lang, "auto_role.updating", { role: role.toString() }), lang })],
      flags: MessageFlags.Ephemeral,
    });

    persist
      .then(() => reply.edit({ embeds: [successEmbed({ description: t(lang, "auto_role.set", { role: role.toString() }), lang })] }).catch(() => null))
      .catch(() => reply.edit({ embeds: [errorEmbed({ description: t(lang, "auto_role.set_error"), lang })] }).catch(() => null));

    refreshDashboard(guild);
  } catch (error) {
    logger.error("Error in auto-role select handler", error as Record<string, unknown>);
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

const refreshDashboard = (guild: Guild) => {
  (async () => {
    try {
      const lang = guild.preferredLocale.split("-")[0];
      const dashboard = findDashboardChannelByGuild(guild);
      if (!dashboard) return;

      const channels = getTextChannelsWithTopic(guild);
      const state = computeLogState(channels, guild.id);
      const container = logPanelContainer({ interaction: lang, ...state });

      const messages = await dashboard.messages.fetch({ limit: 10 });
      const botMessage = messages.find((m) => m.author.id === guild.client.user?.id && m.components.length > 0);
      if (botMessage) {
        await botMessage.edit({ components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => null);
      } else {
        await dashboard.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }
    } catch (err) {
      logger.error("Error refreshing dashboard after auto-role change", err as Record<string, unknown>);
    }
  })();
};
