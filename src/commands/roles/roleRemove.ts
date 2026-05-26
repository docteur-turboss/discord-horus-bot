import {
  ChatInputCommandInteraction,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { t } from "utils/locales/i18n";
import { infoEmbed } from "utils/embeds/infoEmbed";
import { successEmbed } from "utils/embeds/successEmbed";
import { errorEmbed } from "utils/embeds/errorEmbeds";

export const data = new SlashCommandBuilder()
  .setName("role-remove")
  .setNameLocalizations({ fr: "role-retirer" })
  .setDescription("Remove a role from all server members")
  .setDescriptionLocalizations({ fr: "Retirer un rôle à tous les membres du serveur" })
  .addRoleOption((option) =>
    option
      .setName("role")
      .setDescription("The role to remove from everyone")
      .setDescriptionLocalizations({ fr: "Le rôle à retirer à tout le monde" })
      .setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .setContexts(InteractionContextType.Guild);

export const cooldown = 120;

const BATCH_SIZE = 10;
const PROGRESS_INTERVAL = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
  const lang = interaction.locale.split("-")[0];
  const guild = interaction.guild;
  if (!guild) return;

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

  await interaction.deferReply();

  let members = [...guild.members.cache.values()];
  if (guild.memberCount !== members.length) {
    await guild.members.fetch();
    members = [...guild.members.cache.values()];
  }

  const target = members.filter((m) => m.roles.cache.has(role.id));
  const total = target.length;
  let processed = 0;
  let success = 0;
  let failed = 0;
  let batchCount = 0;

  const startedEmbed = infoEmbed({
    description: t(lang, "roles.remove_started", { role: role.toString() }),
    lang,
  });
  await interaction.editReply({ embeds: [startedEmbed] });

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = target.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(batch.map((m) => m.roles.remove(role.id)));

    for (const r of results) {
      if (r.status === "fulfilled") success++;
      else failed++;
    }

    processed += batch.length;
    batchCount++;

    if (batchCount % PROGRESS_INTERVAL === 0 && processed < total) {
      const progressEmbed = infoEmbed({
        description: t(lang, "roles.remove_progress", {
          done: String(processed),
          total: String(total),
        }),
        lang,
      });
      await interaction.editReply({ embeds: [progressEmbed] });
    }
  }

  const doneEmbed = successEmbed({
    description: t(lang, "roles.remove_complete", {
      role: role.toString(),
      success: String(success),
      failed: String(failed),
    }),
    lang,
  });
  await interaction.editReply({ embeds: [doneEmbed] });
};
