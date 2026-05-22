import { ButtonInteraction, Events } from "discord.js";
import { logger } from "utils/logger/logger";
import { t } from "utils/locales/i18n";
import { reply } from "utils/discord/reply";

export const data = {
  event: Events.InteractionCreate,
};

export const main = async (interaction: ButtonInteraction) => {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith("rules.accept_")) return;

  const lang = interaction.locale.split("-")[0];
  const roleId = interaction.customId.slice("rules.accept_".length);

  if (!interaction.guild || !interaction.member) return;

  try {
    const role = interaction.guild.roles.cache.get(roleId);
    if (!role) {
      await reply(interaction, {
        key: "rules.role_not_found",
        type: "error",
        ephemeral: true,
      });
      return;
    }

    const member = interaction.member as any;
    if (member.roles?.cache?.has(roleId)) {
      await reply(interaction, {
        key: "rules.already_accepted",
        type: "info",
        ephemeral: true,
        vars: { role: role.toString() },
      });
      return;
    }

    await member.roles.add(roleId);

    await reply(interaction, {
      key: "rules.accepted",
      vars: { role: role.toString() },
      ephemeral: true,
    });
  } catch (error) {
    logger.error("Error in rules accept button handler", error as Record<string, unknown>);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "An unexpected error occurred. Please try again or contact an administrator.",
        ephemeral: true,
      }).catch(() => null);
    }
  }
};
