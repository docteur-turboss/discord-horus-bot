import { Events, Message, OmitPartialGroupDMChannel, PartialMessage, TextChannel } from "discord.js";
import { getMessageLogChannel } from "utils/discord/getMessageLogChannel";
import { formatContent } from "utils/helper/formatContent";
import { logEmbed } from "utils/embeds/logEmbed";
import { logger } from "utils/logger/logger";
import { t } from "../utils/locales/i18n";

export const data = {
  event: Events.MessageDelete,
};

export const main = async (
  message: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>
) => {
  if (!message?.guild) return;

  try {
    if(message.partial) await message.fetch().catch(() => null);
    if(message?.author?.bot) return;

    const guild = message.guild;
    const logChannel = getMessageLogChannel(guild);
    if(!guild || !logChannel) return;

    const lang = guild.preferredLocale.split("-")[0];

    const embeds = logEmbed({
      type: "message",
      lang,
      description: t(lang, "embeds.logs.message.delete.description"),
      fields: [
        {
          name: t(lang, "embeds.logs.fields.user"),
          value: message.author?`<@${message.author.id}>`:t(lang, "embeds.logs.fields.user.not_found"),
          inline: true,
        },
        {
          name: t(lang, "embeds.logs.fields.channel"),
          value: `<#${message.channel.id}>`,
          inline: true,
        },
        {
          name: t(lang, "embeds.logs.fields.content"),
          value: formatContent(message),
          inline: false,
        },
      ],
    });

    logChannel.send({
      embeds: [embeds]
    });
  } catch (error) {
    logger.error("Error in message delete events listener", error as Record<string, unknown>);
  }
};