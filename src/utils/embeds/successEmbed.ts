import { APIEmbedField, EmbedBuilder } from "discord.js";
import { t } from "utils/locales/i18n";

export const successEmbed = ({description = "", fields = [], lang="en"}: {fields?: APIEmbedField[], description?: string, lang: string}) => {
  return new EmbedBuilder()
    .setTimestamp()
    .setFields(fields)
    .setColor("#57F287") // Vert Discord
    .setTitle(t(lang, "embeds.success"))
    .setDescription(description)
    .setFooter({ text: t(lang, "embeds.footer") });
};