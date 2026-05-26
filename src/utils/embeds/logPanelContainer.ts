import { ButtonStyle, ChatInputCommandInteraction, ContainerBuilder, SectionBuilder } from "discord.js";
import { t } from "../locales/i18n";
import { TranslationKey } from "utils/locales/i18n.types";

const buildSection = (
  key: string,
  isActive: boolean,
  interaction: ChatInputCommandInteraction|string
) => {
  return (section: SectionBuilder) =>
    section
    .addTextDisplayComponents(textDisplay => 
      textDisplay.setContent(
        t(interaction, `embeds.logs.${key}` as TranslationKey)
      )
    )
    .setButtonAccessory(button => 
      button
        .setCustomId(`embeds.logs.${key}.${isActive ? "inactif" : "actif"}`)
        .setLabel(t(interaction, `action.btns.${isActive ? "actif" : "inactif"}`))
        .setStyle(isActive ? ButtonStyle.Success : ButtonStyle.Secondary)
    );
};

export const logPanelContainer = ({
  hasRoleLog,
  interaction,
  hasMessageLog,
  hasChannelLog,
  hasModerationLog,
  hasTmpVoice,
  hasAutoRole,
}:{
  interaction: ChatInputCommandInteraction|string,
  hasMessageLog: boolean,
  hasChannelLog: boolean,
  hasRoleLog: boolean,
  hasModerationLog: boolean,
  hasTmpVoice: boolean,
  hasAutoRole: boolean,
}) => new ContainerBuilder()
  .setAccentColor(0x5865F2)
  .addTextDisplayComponents((textDiplay) =>
    textDiplay.setContent(`# ${t(interaction, "embeds.logs.admin_title")}`)
  )
  .addSeparatorComponents((separator) => separator)
  .addTextDisplayComponents((textDiplay) =>
    textDiplay.setContent(`## ${t(interaction, "embeds.logs.category_logs")}`)
  )
  .addSectionComponents(buildSection("message", hasMessageLog, interaction))
  .addSectionComponents(buildSection("roles", hasRoleLog, interaction))
  .addSectionComponents(buildSection("moderation", hasModerationLog, interaction))
  .addSectionComponents(buildSection("channels", hasChannelLog, interaction))
  .addSeparatorComponents((separator) => separator)
  .addTextDisplayComponents((textDiplay) =>
    textDiplay.setContent(`## ${t(interaction, "embeds.logs.category_voice")}`)
  )
  .addSectionComponents(buildSection("tmp_voice", hasTmpVoice, interaction))
  .addSeparatorComponents((separator) => separator)
  .addTextDisplayComponents((textDiplay) =>
    textDiplay.setContent(`## ${t(interaction, "embeds.logs.category_auto_role")}`)
  )
  .addSectionComponents(buildSection("auto_role", hasAutoRole, interaction));