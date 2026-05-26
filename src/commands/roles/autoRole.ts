import { ChatInputCommandInteraction, EmbedBuilder, Guild, InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { t } from "utils/locales/i18n";
import { infoEmbed } from "utils/embeds/infoEmbed";
import { successEmbed } from "utils/embeds/successEmbed";
import { errorEmbed } from "utils/embeds/errorEmbeds";
import { autoRoleManager } from "utils/discord/autoRoleManager";
import { logPanelContainer } from "utils/embeds/logPanelContainer";
import { computeLogState, findDashboardChannelByGuild, getTextChannelsWithTopic } from "utils/helper/getLogChannelWithTopic";
import { logger } from "utils/logger/logger";

export const data = new SlashCommandBuilder()
  .setName("auto-role")
  .setNameLocalizations({ fr: "role-auto" })
  .setDescription("Configure the auto-role for new members")
  .setDescriptionLocalizations({ fr: "Configurer le rôle automatique pour les nouveaux membres" })
  .addSubcommand((sub) =>
    sub
      .setName("set")
      .setDescription("Set the auto-role for new members")
      .setDescriptionLocalizations({ fr: "Définir le rôle automatique pour les nouveaux membres" })
      .addRoleOption((option) =>
        option
          .setName("role")
          .setDescription("The role to assign automatically")
          .setDescriptionLocalizations({ fr: "Le rôle à attribuer automatiquement" })
          .setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName("remove")
      .setDescription("Remove the auto-role configuration")
      .setDescriptionLocalizations({ fr: "Supprimer la configuration du rôle automatique" }),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setContexts(InteractionContextType.Guild);

export const main = async (interaction: ChatInputCommandInteraction) => {
  const lang = interaction.locale.split("-")[0];
  const guild = interaction.guild;
  if (!guild) return;

  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "set") {
    const role = interaction.options.getRole("role", true);

    if (role.id === guild.id) {
      await interaction.reply({
        embeds: [errorEmbed({ description: t(lang, "roles.everyone_error"), lang })],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (role.managed) {
      await interaction.reply({
        embeds: [errorEmbed({ description: t(lang, "roles.bot_role_error"), lang })],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const botMember = guild.members.me;
    if (!botMember || botMember.roles.highest.position <= role.position) {
      await interaction.reply({
        embeds: [errorEmbed({ description: t(lang, "roles.hierarchy_error"), lang })],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const persist = autoRoleManager.setAutoRole(guild, role.id);

    await interaction.reply({
      embeds: [infoEmbed({ description: t(lang, "auto_role.updating", { role: role.toString() }), lang })],
      flags: MessageFlags.Ephemeral,
    });

    persist
      .then(() => {
        const embed = successEmbed({ description: t(lang, "auto_role.set", { role: role.toString() }), lang });
        interaction.editReply({ embeds: [embed] }).catch(() => sendFallback(interaction, embed));
      })
      .catch(() => {
        const embed = errorEmbed({ description: t(lang, "auto_role.set_error"), lang });
        interaction.editReply({ embeds: [embed] }).catch(() => sendFallback(interaction, embed));
      });

    refreshDashboard(guild, lang);
    return;
  }

  if (subcommand === "remove") {
    const current = autoRoleManager.getAutoRole(guild.id);
    if (!current) {
      await interaction.reply({
        embeds: [infoEmbed({ description: t(lang, "auto_role.not_configured"), lang })],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const persist = autoRoleManager.removeAutoRole(guild);

    await interaction.reply({
      embeds: [infoEmbed({ description: t(lang, "auto_role.updating_remove"), lang })],
      flags: MessageFlags.Ephemeral,
    });

    persist
      .then(() => {
        const embed = successEmbed({ description: t(lang, "auto_role.removed"), lang });
        interaction.editReply({ embeds: [embed] }).catch(() => sendFallback(interaction, embed));
      })
      .catch(() => {
        const embed = errorEmbed({ description: t(lang, "auto_role.remove_error"), lang });
        interaction.editReply({ embeds: [embed] }).catch(() => sendFallback(interaction, embed));
      });

    refreshDashboard(guild, lang);
  }
};

const sendFallback = async (interaction: ChatInputCommandInteraction, embed: EmbedBuilder) => {
  const channel = interaction.channel;
  if (!channel || !("send" in channel)) return;

  try {
    const msg = await channel.send({
      content: `<@${interaction.user.id}>`,
      embeds: [embed],
    });
    setTimeout(() => {
      msg.delete().catch(() => null);
    }, 5 * 60 * 1000);
  } catch (err) {
    logger.error("Fallback message failed", { error: String(err) });
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
    } catch (err) {
      // ignore dashboard refresh errors
    }
  })();
};
