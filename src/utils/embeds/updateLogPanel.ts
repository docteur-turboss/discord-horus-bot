import { ButtonInteraction, MessageFlags } from "discord.js";
import { logPanelContainer } from "utils/embeds/logPanelContainer";
import { computeLogState } from "utils/helper/getLogChannelWithTopic";

export const updatePanel = async (
  interaction: ButtonInteraction,
  state: ReturnType<typeof computeLogState>
) => {
  const lang = interaction.guild!.preferredLocale.split("-")[0];

  const container = logPanelContainer({
    interaction: lang,
    ...state,
  });

  await interaction.update({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });
};