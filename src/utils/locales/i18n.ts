import en from "../../locales/en.json";
import fr from "../../locales/fr.json";
import { ChatInputCommandInteraction } from "discord.js";

const translations: Record<string, any> = {
  en,
  fr,
};

export const t = (
  interaction: ChatInputCommandInteraction,
  key: string,
  vars?: Record<string, string>
) => {
  const locale = interaction.locale?.split("-")[0] ?? "en";

  let text =
    translations[locale]?.[key] ??
    translations["en"]?.[key] ??
    key;

  if (vars) {
    for (const v in vars) {
      text = text.replace(`{${v}}`, vars[v]);
    }
  }

  return text;
}