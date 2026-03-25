import { 
  ChatInputCommandInteraction, 
  InteractionContextType, 
  PermissionFlagsBits, 
  SlashCommandBuilder,
  MessageFlags,
  ChannelType,
} from "discord.js";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { 
  IC_ThinSpace,
  IC_ZeroWidthSpace,
  IC_ZeroWidthJoiner,
  IC_ZeroWidthNonJoiner,
} from "utils/consts/invisiblesChars";
import { reply } from "utils/discord/reply";
import { t } from "utils/locales/i18n";
import { logPanelContainer } from "utils/embeds/logPanelContainer";
import { computeLogState, findDashboardChannel, getTextChannelsWithTopic } from "utils/helper/getLogChannelWithTopic";
import { createLogDashboard } from "utils/discord/createLogDashboard";

export const data = new SlashCommandBuilder()
.setName("log")
.setNameLocalizations({
  fr: "logs",
})
.setDescription("Configure the server logging system.")
.setDescriptionLocalizations({
  fr: "Configurer le système de logs du serveur.",
})
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
.setContexts(InteractionContextType.Guild);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
  try {
    const guild = interaction.guild;
    if (!guild) return;

    const channels = getTextChannelsWithTopic(guild);

    const state = computeLogState(channels);

    const dashboardCheck = await findDashboardChannel(guild, channels);

    if (dashboardCheck === "ALREADY_EXISTS") {
      return reply(interaction, {
        key: "errors.log_already_exist",
        ephemeral: true,
        type: "error",
      });
    }

    const channel =
      dashboardCheck instanceof Object
        ? dashboardCheck
        : await createLogDashboard(interaction);

    const container = logPanelContainer({
      interaction,
      ...state,
    });

    await channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    await reply(interaction, {
      key: "embeds.logs.successful_created",
      ephemeral: true,
      type: "info",
      vars: {
        channel: `<#${channel.id}>`,
      },
    });

  } catch (err) {
    catchErrorInCommand(err, interaction, "CreateLogSystem");
  }
};