import { APIEmbedField, EmbedBuilder } from "discord.js";
import { t } from "utils/locales/i18n";

export const warningEmbed = ({description = "", fields = [], lang="en"}: {fields?: APIEmbedField[], description?: string, lang: string}) => {
  return new EmbedBuilder()
    .setTimestamp()
    .setFields(fields)
    .setColor("#FEE75C") // Jaune Discord
    .setTitle(t(lang, "embeds.warning"))
    .setDescription(description)
    .setFooter({ text: t(lang, "embeds.footer") });
};