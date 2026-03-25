import { ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ContainerBuilder, SectionBuilder } from "discord.js";
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
}:{
  interaction: ChatInputCommandInteraction|string,
  hasMessageLog: boolean,
  hasChannelLog: boolean,
  hasRoleLog: boolean,
}) => new ContainerBuilder()
  .setAccentColor(0x5865F2)
  .addTextDisplayComponents((textDiplay) =>
    textDiplay.setContent(`# ${t(interaction, "embeds.logs.title")}`)
  )
  .addSeparatorComponents((separator) => separator)
  .addSectionComponents(buildSection("message", hasMessageLog, interaction))
  .addSectionComponents(buildSection("roles", hasRoleLog, interaction))
  .addSectionComponents(buildSection("channels", hasChannelLog, interaction));
  // .addSectionComponents(buildSection("candidatures", false, interaction))
  // .addSectionComponents(buildSection("tickets", false, interaction))
  // .addSectionComponents(buildSection("transcriptions", false, interaction));