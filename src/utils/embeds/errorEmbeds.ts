import { APIEmbedField, EmbedBuilder } from "discord.js";
import { t } from "utils/locales/i18n";

export const errorEmbed = ({description = "", fields = [], lang="en"}: {fields?: APIEmbedField[], description?: string, lang: string}) => {
  return new EmbedBuilder()
    .setTimestamp()
    .setFields(fields)
    .setColor("#ED4245") // Red Discord
    .setTitle(t(lang, "embeds.success"))
    .setDescription(description)
    .setFooter({ text: t(lang, "embeds.footer") });
};